# Strauss 常見問題與解決方案

## 問題 1: PSR 介面應該前綴化嗎？

**問題**: 使用 Strauss 後，實作 PSR 介面的類別無法正常工作。

**原因**: PSR 介面（如 `Psr\Log\LoggerInterface`）是跨套件的標準介面。如果前綴化，不同套件就無法互相配合。

**解決方案**:
```json
{
  "extra": {
    "strauss": {
      "namespace_prefix": "MyPlugin\\Deps\\",
      "exclude_from_prefix": {
        "packages": [
          "psr/log",
          "psr/container",
          "psr/http-message",
          "psr/http-client",
          "psr/cache"
        ]
      }
    }
  }
}
```

**範例**: 從測試案例 `ExcludeFromPrefixFeatureTest.php`
```php
// 正確: PSR 介面不被前綴
namespace Psr\Container;
interface ContainerInterface {}

// 正確: 實作類別被前綴，但仍可實作原始介面
namespace MyPlugin\Deps\Vendor\Package;
use Psr\Container\ContainerInterface;
class Container implements ContainerInterface {}
```

## 問題 2: 多路徑 PSR-4 套件

**問題**: 某些套件在 PSR-4 autoload 中定義多個路徑，但只有一個被處理。

**範例**: `rubix/tensor` 套件
```json
{
  "autoload": {
    "psr-4": {
      "Tensor\\": ["src/", "other/"]
    }
  }
}
```

**解決方案**: Strauss 會自動處理所有路徑。確保沒有使用 `exclude_from_copy` 排除任何路徑。

**驗證**:
```bash
# 檢查所有預期的檔案是否都被複製
find vendor-prefixed/rubix/tensor -name "*.php"
```

**參考**: 測試案例 `MozartIssue48Test.php`

## 問題 3: 註解中的關鍵字被前綴

**問題**: 註解中的 `as` 或類別名稱被錯誤地前綴化。

```php
// 錯誤的輸出
foreach (self::$_observers MyPrefix_as $func) {
```

**解決方案**: Strauss 使用 PHP-Parser，只會解析實際的程式碼，不會處理註解。這個問題在早期 Mozart 中存在，但 Strauss 已經解決。

**確認**: 測試案例 `MozartIssue86Test.php`
```php
// 正確: 註解保持不變
// Use the class as a factory
foreach (self::$_observers as $func) {
```

## 問題 4: 沒有 autoload 的舊套件

**問題**: 某些舊套件沒有 `composer.json` 的 autoload 設定。

**解決方案**: 使用 `override_autoload` 手動定義：

```json
{
  "extra": {
    "strauss": {
      "override_autoload": {
        "pear/pear-core-minimal": {
          "classmap": ["src/"]
        },
        "old/legacy-package": {
          "psr-4": {
            "Legacy\\Package\\": "lib/"
          }
        }
      }
    }
  }
}
```

**參考**: 測試案例 `MozartIssue86Test.php`

## 問題 5: 套件刪除與 Symlinks

**問題**: 設定 `delete_vendor_packages: true` 後，某些套件無法刪除。

**原因**: Symlinked 目錄（通常來自本地開發套件）不會被刪除以避免資料丟失。

**解決方案**: 這是預期行為。Strauss 檢測 symlinks 並跳過刪除：

```json
{
  "repositories": [
    {
      "type": "path",
      "url": "../local-package",
      "symlink": true
    }
  ],
  "extra": {
    "strauss": {
      "delete_vendor_packages": true
    }
  }
}
```

**參考**: 測試案例 `CleanupSymlinkIntegrationTest.php`

## 問題 6: 函數前綴與全域命名空間

**問題**: 全域函數未被前綴化。

**確認配置**:
```json
{
  "extra": {
    "strauss": {
      "functions_prefix": "myplugin_"
    }
  }
}
```

**注意事項**:
- 只有**全域命名空間**中的函數會被前綴
- 命名空間中的函數由命名空間前綴處理
- 函數前綴應該小寫加底線（慣例）

```php
// 全域函數 - 會被前綴
function helper() {}  // → function myplugin_helper() {}

// 命名空間函數 - 由命名空間前綴處理
namespace Vendor\Package;
function helper() {}  // → namespace MyPlugin\Deps\Vendor\Package; function helper() {}
```

**參考**: 測試案例 `UpdateCallSitesIntegrationTest.php`

## 問題 7: 常數前綴化

**問題**: `define()` 常數沒有被前綴。

**配置**:
```json
{
  "extra": {
    "strauss": {
      "constant_prefix": "MYPLUGIN_"
    }
  }
}
```

**支援的格式**:
```php
// ✅ 支援
define('CONSTANT_NAME', 'value');

// ✅ 支援
define("CONSTANT_NAME", "value");

// ❌ 不支援（動態常數名稱）
define($variable_name, 'value');
```

## 問題 8: 更新呼叫位置失敗

**問題**: 專案檔案中的類別引用沒有更新。

**檢查清單**:

1. **確認 `update_call_sites` 已啟用**:
```json
{
  "extra": {
    "strauss": {
      "update_call_sites": true
    }
  }
}
```

2. **確認檔案在 autoload 中**:
```json
{
  "autoload": {
    "psr-4": {
      "MyPlugin\\": "src/"
    },
    "files": ["my-plugin.php"]
  }
}
```

3. **或明確指定路徑**:
```json
{
  "extra": {
    "strauss": {
      "update_call_sites": ["src", "includes", "my-plugin.php"]
    }
  }
}
```

4. **檢查檔案是否為 PHP 檔案**: 只有 `.php` 檔案會被處理。

5. **查看執行日誌**: 使用 `--debug` 查看哪些檔案被掃描：
```bash
composer strauss -- --debug
```

## 問題 9: 自動載入器未生成

**問題**: `vendor-prefixed/autoload.php` 未被創建。

**可能原因**:

1. **檢查目標目錄**: 確認 `target_directory` 設定正確
```json
{
  "extra": {
    "strauss": {
      "target_directory": "vendor-prefixed"
    }
  }
}
```

2. **確認有檔案被複製**: 檢查 `vendor-prefixed/` 目錄是否有內容

3. **重新執行**:
```bash
rm -rf vendor-prefixed
composer strauss
```

## 問題 10: 類別名稱衝突

**問題**: 兩個不同套件有相同的全域類別名稱。

```php
// 套件 A
class Utils {}

// 套件 B
class Utils {}
```

**解決方案**: 使用 `classmap_prefix`：
```json
{
  "extra": {
    "strauss": {
      "classmap_prefix": "MyPlugin_"
    }
  }
}
```

**結果**:
```php
// 都變成
class MyPlugin_Utils {}
```

**注意**: 這會讓兩個類別有相同的前綴名稱，仍然會衝突。最好的解決方案是這些套件應該使用命名空間。

**替代方案**: 使用 `exclude_from_copy` 排除其中一個套件，或手動處理衝突。

## 問題 11: `vendor/` 和 `vendor-prefixed/` 都存在，該用哪個？

**場景**:
```
project/
├── vendor/              # Composer 原始套件
├── vendor-prefixed/     # Strauss 處理後的套件
└── my-plugin.php
```

**答案**: 取決於你的配置和需求。

### 選項 1: 同時使用（推薦用於開發）
```php
<?php
// 載入 Composer 的 autoloader（用於開發依賴）
require_once __DIR__ . '/vendor/autoload.php';

// 載入 Strauss 的 autoloader（用於生產依賴）
require_once __DIR__ . '/vendor-prefixed/autoload.php';
```

### 選項 2: 只使用 Strauss（推薦用於生產）
```json
{
  "extra": {
    "strauss": {
      "delete_vendor_packages": true,
      "include_root_autoload": true
    }
  }
}
```

```php
<?php
// 只需要一個 autoloader
require_once __DIR__ . '/vendor-prefixed/autoload.php';
```

### 選項 3: 使用 `target_directory: "vendor"`
```json
{
  "extra": {
    "strauss": {
      "target_directory": "vendor",
      "delete_vendor_packages": true
    }
  }
}
```

**警告**: 這會覆蓋原始套件，確保你知道自己在做什麼。

## 問題 12: Git 如何處理生成的檔案？

**選項 1: 提交前綴化的檔案（推薦用於 WordPress 外掛）**

`.gitignore`:
```gitignore
/vendor/
```

**優點**:
- 使用者下載後立即可用
- 不需要執行 `composer install`

**缺點**:
- Repo 變大
- 每次更新依賴都需要提交大量變更

**選項 2: 不提交，在部署時生成（推薦用於應用程式）**

`.gitignore`:
```gitignore
/vendor/
/vendor-prefixed/
```

**部署腳本**:
```bash
#!/bin/bash
composer install --no-dev
composer strauss
```

**優點**:
- Repo 保持乾淨
- 只追蹤源碼

**缺點**:
- 需要部署流程
- 使用者需要執行額外步驟

## 問題 13: 執行兩次 Strauss 會發生什麼？

**答案**: Strauss 是冪等的，多次執行應該產生相同結果。

**內部機制**:
- Strauss 會檢測已經前綴化的符號並跳過
- 每次執行前會清理目標目錄

**最佳實踐**:
```json
{
  "scripts": {
    "post-install-cmd": ["@strauss"],
    "post-update-cmd": ["@strauss"]
  }
}
```

這樣每次 `composer install` 或 `composer update` 都會自動執行 Strauss。

## 問題 14: 如何排除測試檔案減少體積？

**配置**:
```json
{
  "extra": {
    "strauss": {
      "exclude_from_copy": {
        "file_patterns": [
          "/[Tt]ests?/",
          "/\\.md$/",
          "/\\.dist$/",
          "/\\.xml\\.dist$/",
          "/phpunit/",
          "/\\.github/",
          "/\\.git/",
          "/composer\\.(json|lock)$/",
          "/LICENSE/",
          "/CHANGELOG/",
          "/README/"
        ]
      }
    }
  }
}
```

**驗證減少的大小**:
```bash
# 執行前
du -sh vendor/

# 執行後
du -sh vendor-prefixed/
```

## 問題 15: 命名空間替換模式不工作

**問題**: `namespace_replacement_patterns` 沒有效果。

**檢查清單**:

1. **確認正規表達式語法**:
```json
{
  "namespace_replacement_patterns": {
    "~Vendor\\\\Package~": "MyPlugin\\\\Vendor\\\\Package"
  }
}
```

注意: JSON 中需要雙重轉義 `\\\\`

2. **測試正規表達式**: 在 PHP 中測試
```php
<?php
$pattern = '~Vendor\\\\Package~';
$replacement = 'MyPlugin\\\\Vendor\\\\Package';
$subject = 'Vendor\\Package\\Class';
echo preg_replace($pattern, $replacement, $subject);
```

3. **檢查優先順序**: 模式按順序應用，第一個匹配的會被使用

4. **使用 `--debug` 查看處理過程**:
```bash
composer strauss -- --debug | grep "Namespace.*changed"
```
