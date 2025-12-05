# Strauss 快速參考

## 安裝方式

### 方式 1: .phar 檔案 (推薦)

**composer.json**:
```json
{
  "scripts": {
    "prefix-namespaces": [
      "sh -c 'test -f ./bin/strauss.phar || curl -o bin/strauss.phar -L -C - https://github.com/BrianHenryIE/strauss/releases/latest/download/strauss.phar'",
      "@php bin/strauss.phar",
      "@composer dump-autoload"
    ],
    "post-install-cmd": ["@prefix-namespaces"],
    "post-update-cmd": ["@prefix-namespaces"]
  }
}
```

**.gitignore**:
```
bin/strauss.phar
```

### 方式 2: Composer 依賴

```bash
composer require --dev brianhenryie/strauss
```

**composer.json**:
```json
{
  "scripts": {
    "strauss": ["strauss", "@composer dump-autoload"],
    "post-install-cmd": ["@strauss"],
    "post-update-cmd": ["@strauss"]
  }
}
```

## 基本配置模板

### 最小配置
```json
{
  "extra": {
    "strauss": {
      "namespace_prefix": "MyPlugin\\Vendor\\"
    }
  }
}
```

### 標準配置
```json
{
  "extra": {
    "strauss": {
      "target_directory": "vendor-prefixed",
      "namespace_prefix": "MyPlugin\\Vendor\\",
      "classmap_prefix": "MyPlugin_Vendor_",
      "exclude_from_prefix": {
        "packages": ["psr/log", "psr/container"]
      }
    }
  }
}
```

### 完整配置
```json
{
  "extra": {
    "strauss": {
      "target_directory": "vendor-prefixed",
      "namespace_prefix": "MyPlugin\\Vendor\\",
      "classmap_prefix": "MyPlugin_Vendor_",
      "constant_prefix": "MYPLUGIN_VENDOR_",
      "functions_prefix": "myplugin_vendor_",
      "update_call_sites": true,
      "delete_vendor_packages": false,
      "exclude_from_copy": {
        "file_patterns": ["/tests?/", "/\\.md$/"]
      },
      "exclude_from_prefix": {
        "packages": ["psr/log"],
        "namespaces": ["Psr\\Log"]
      }
    }
  }
}
```

## 常用命令

```bash
# 執行 Strauss
composer strauss

# 乾跑（不修改檔案）
composer strauss -- --dry-run

# 詳細輸出
composer strauss -- --debug

# 靜默模式
composer strauss -- --silent

# 更新專案呼叫位置
composer strauss -- --updateCallSites=true
composer strauss -- --updateCallSites=src,includes

# Replace 命令（原地重命名）
strauss replace --from "Old\\Namespace" --to "New\\Namespace" --paths "src"

# 包含 autoloader 到 vendor/autoload.php
strauss include-autoloader
```

## 配置選項速查

| 選項 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `target_directory` | string | `"vendor-prefixed"` | 輸出目錄 |
| `namespace_prefix` | string | 自動推斷 | 命名空間前綴 |
| `classmap_prefix` | string | 自動推斷 | 全域類別前綴 |
| `constant_prefix` | string\|null | `null` | 常數前綴 |
| `functions_prefix` | string\|null | `null` | 函數前綴 |
| `packages` | string[] | `[]` | 要處理的套件 |
| `update_call_sites` | bool\|string[] | `false` | 更新專案檔案 |
| `delete_vendor_packages` | bool | `false` | 刪除原始套件 |
| `delete_vendor_files` | bool | `false` | 刪除原始檔案 |
| `include_root_autoload` | bool | `false` | 包含專案 autoload |
| `override_autoload` | object | `{}` | 覆蓋套件 autoload |
| `exclude_from_copy` | object | `{}` | 排除複製 |
| `exclude_from_prefix` | object | `{}` | 排除前綴 |
| `namespace_replacement_patterns` | object | `{}` | 命名空間替換規則 |

## 排除規則速查

### exclude_from_copy

```json
{
  "exclude_from_copy": {
    "packages": ["vendor/package-name"],
    "namespaces": ["Vendor\\Package\\Namespace"],
    "file_patterns": ["/regex-pattern/", "/another-pattern/"]
  }
}
```

**常用 file_patterns**:
```json
[
  "/[Tt]ests?/",           // 測試目錄
  "/\\.md$/",              // Markdown 檔案
  "/LICENSE/",             // 授權檔案
  "/\\.dist$/",            // .dist 檔案
  "/composer\\.(json|lock)$/", // Composer 檔案
  "/phpunit/",             // PHPUnit
  "/\\.github/"            // GitHub 設定
]
```

### exclude_from_prefix

```json
{
  "exclude_from_prefix": {
    "packages": ["psr/log", "psr/container"],
    "namespaces": ["Psr\\Log", "Psr\\Container"],
    "file_patterns": ["/^psr.*$/"]
  }
}
```

## 常見 PSR 套件排除

```json
{
  "exclude_from_prefix": {
    "packages": [
      "psr/log",
      "psr/container",
      "psr/cache",
      "psr/http-message",
      "psr/http-client",
      "psr/http-factory",
      "psr/simple-cache",
      "psr/event-dispatcher"
    ]
  }
}
```

## 載入方式速查

### 方式 1: 只載入 Strauss
```php
<?php
require_once __DIR__ . '/vendor-prefixed/autoload.php';
```

### 方式 2: 同時載入兩者
```php
<?php
require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/vendor-prefixed/autoload.php';
```

### 方式 3: 使用 include_root_autoload
```json
{
  "extra": {
    "strauss": {
      "include_root_autoload": true
    }
  }
}
```

```php
<?php
// 只需要一個
require_once __DIR__ . '/vendor-prefixed/autoload.php';
```

## 除錯檢查清單

- [ ] 檢查 `composer.json` 的 `extra.strauss` 配置
- [ ] 確認依賴已安裝 (`composer install`)
- [ ] 執行 `composer strauss -- --debug`
- [ ] 檢查 `vendor-prefixed/` 目錄是否存在
- [ ] 檢查 `vendor-prefixed/autoload.php` 是否存在
- [ ] 測試類別是否可載入: `class_exists('MyPrefix\\Vendor\\Class')`
- [ ] 檢查原始類別是否仍存在（不應該在生產中）
- [ ] 驗證 autoload 檔案內容
- [ ] 比對原始和前綴化檔案的差異

## 測試命令

```bash
# 檢查生成的 autoload 檔案
cat vendor-prefixed/autoload.php
cat vendor-prefixed/composer/autoload_classmap.php

# 搜尋原始命名空間（應該不存在）
grep -r "namespace Monolog" vendor-prefixed/

# 搜尋前綴後的命名空間（應該存在）
grep -r "namespace MyPlugin\\\\Vendor\\\\Monolog" vendor-prefixed/

# 測試類別是否可載入
php -r "require 'vendor-prefixed/autoload.php'; var_dump(class_exists('MyPlugin\\Vendor\\Monolog\\Logger'));"

# 檢查目錄大小
du -sh vendor/
du -sh vendor-prefixed/

# 計算檔案數量
find vendor/ -type f | wc -l
find vendor-prefixed/ -type f | wc -l
```

## 效能優化清單

- [ ] 使用 `exclude_from_copy` 排除不需要的檔案
- [ ] 使用 `composer install --no-dev` 排除開發依賴
- [ ] 考慮快取 `vendor-prefixed/` 目錄
- [ ] 只處理必要的套件（使用 `packages` 選項）
- [ ] 在 CI/CD 中平行執行其他任務

## Git 設定建議

### 選項 1: 提交前綴化檔案（WordPress 外掛）
**.gitignore**:
```
/vendor/
bin/strauss.phar
```

### 選項 2: 不提交前綴化檔案（應用程式）
**.gitignore**:
```
/vendor/
/vendor-prefixed/
bin/strauss.phar
```

## 常見錯誤訊息

| 錯誤 | 原因 | 解決方案 |
|------|------|----------|
| `Expected file does not exist` | 檔案未被複製 | 檢查 `exclude_from_copy` 設定 |
| `Class not found` | Autoload 未正確設定 | 重新執行 `composer dump-autoload` |
| `Namespace already prefixed` | 重複執行 | 這是正常的，Strauss 會跳過 |
| `Cannot write to directory` | 權限問題 | 檢查目錄權限 |

## 向後兼容 (Mozart 遷移)

Mozart 配置會自動被讀取：

| Mozart | Strauss |
|--------|---------|
| `dep_directory` | `target_directory` |
| `dep_namespace` | `namespace_prefix` |
| `classmap_directory` | (移除，使用 `target_directory`) |
| `exclude_packages` | `exclude_from_copy.packages` |

## 範例專案結構

```
my-plugin/
├── src/
│   └── MyPlugin.php
├── vendor/                    # Composer 原始套件
│   └── monolog/
├── vendor-prefixed/           # Strauss 處理後
│   ├── autoload.php          # 主要載入點
│   ├── monolog/              # 前綴化的套件
│   └── composer/             # Autoload 檔案
├── bin/
│   ├── .gitkeep
│   └── strauss.phar          # (ignored)
├── composer.json
├── composer.lock
└── my-plugin.php             # 主檔案
```

## 資源連結

- **GitHub**: https://github.com/BrianHenryIE/strauss
- **文檔**: README.md
- **問題回報**: https://github.com/BrianHenryIE/strauss/issues
- **測試覆蓋率**: https://brianhenryie.github.io/strauss/

## 版本注意事項

### 重大變更 (Breaking Changes)

- **v0.25.0**: 會複製所有檔案
- **v0.21.0**: 會前綴全域函數
- **v0.16.0**: 不再前綴 PHP 內建類別
- **v0.14.0**: `psr/*` 套件不再預設排除
- **v0.12.0**: 預設 `target_directory` 從 `strauss` 改為 `vendor-prefixed`

### PHP 版本支援

Strauss 遵守 WordPress 的 PHP 版本要求，不會領先於 WordPress 提升最低 PHP 版本。
