# Strauss 使用範例

## 基本使用

### 範例 1: 最小配置

專案只需要添加命名空間前綴：

```json
{
  "name": "my-company/my-plugin",
  "require": {
    "monolog/monolog": "^2.0"
  },
  "autoload": {
    "psr-4": {
      "MyCompany\\MyPlugin\\": "src/"
    }
  },
  "extra": {
    "strauss": {
      "namespace_prefix": "MyCompany\\MyPlugin\\Vendor\\"
    }
  }
}
```

**執行**:
```bash
composer install
composer strauss
```

**結果**:
- `vendor-prefixed/monolog/monolog/` 目錄被創建
- 所有命名空間從 `Monolog\` 變成 `MyCompany\MyPlugin\Vendor\Monolog\`
- `vendor-prefixed/autoload.php` 被創建

**使用**:
```php
<?php
require_once __DIR__ . '/vendor-prefixed/autoload.php';

use MyCompany\MyPlugin\Vendor\Monolog\Logger;
use MyCompany\MyPlugin\Vendor\Monolog\Handler\StreamHandler;

$log = new Logger('name');
$log->pushHandler(new StreamHandler('app.log', Logger::WARNING));
```

### 範例 2: 使用 .phar 檔案

```json
{
  "scripts": {
    "prefix-namespaces": [
      "sh -c 'test -f ./bin/strauss.phar || curl -o bin/strauss.phar -L -C - https://github.com/BrianHenryIE/strauss/releases/latest/download/strauss.phar'",
      "@php bin/strauss.phar",
      "@composer dump-autoload"
    ],
    "post-install-cmd": [
      "@prefix-namespaces"
    ],
    "post-update-cmd": [
      "@prefix-namespaces"
    ]
  },
  "extra": {
    "strauss": {
      "namespace_prefix": "MyPlugin\\Deps\\"
    }
  }
}
```

## WordPress 外掛開發

### 範例 3: WordPress 外掛完整設置

```json
{
  "name": "mycompany/wp-my-plugin",
  "description": "A WordPress plugin",
  "type": "wordpress-plugin",
  "require": {
    "php": ">=7.4",
    "guzzlehttp/guzzle": "^7.0",
    "symfony/dotenv": "^5.0",
    "monolog/monolog": "^2.0"
  },
  "autoload": {
    "psr-4": {
      "MyCompany\\WPMyPlugin\\": "src/"
    },
    "files": ["wp-my-plugin.php"]
  },
  "extra": {
    "strauss": {
      "target_directory": "vendor-prefixed",
      "namespace_prefix": "MyCompany\\WPMyPlugin\\Deps\\",
      "classmap_prefix": "MyCompany_WPMyPlugin_",
      "constant_prefix": "MYCOMPANY_WPMYPLUGIN_",
      "update_call_sites": true,
      "delete_vendor_packages": false,
      "exclude_from_prefix": {
        "packages": ["psr/log"],
        "namespaces": ["Psr\\Log"]
      }
    }
  },
  "scripts": {
    "strauss": [
      "strauss",
      "@composer dump-autoload"
    ],
    "post-install-cmd": ["@strauss"],
    "post-update-cmd": ["@strauss"]
  }
}
```

**主檔案** `wp-my-plugin.php`:
```php
<?php
/**
 * Plugin Name: My Plugin
 * Description: A WordPress plugin with namespaced dependencies
 * Version: 1.0.0
 */

require_once __DIR__ . '/vendor-prefixed/autoload.php';

use MyCompany\WPMyPlugin\Deps\GuzzleHttp\Client;
use MyCompany\WPMyPlugin\Deps\Symfony\Component\Dotenv\Dotenv;

$client = new Client();
$dotenv = new Dotenv();
```

## 處理衝突

### 範例 4: 兩個外掛使用不同版本的相同套件

**外掛 A**:
```json
{
  "name": "company-a/plugin-a",
  "require": {
    "guzzlehttp/guzzle": "^6.0"
  },
  "extra": {
    "strauss": {
      "namespace_prefix": "CompanyA\\PluginA\\Vendor\\"
    }
  }
}
```

**外掛 B**:
```json
{
  "name": "company-b/plugin-b",
  "require": {
    "guzzlehttp/guzzle": "^7.0"
  },
  "extra": {
    "strauss": {
      "namespace_prefix": "CompanyB\\PluginB\\Vendor\\"
    }
  }
}
```

**結果**: 兩個外掛可以同時啟用，各自使用自己版本的 Guzzle，不會衝突。

## 進階使用

### 範例 5: 排除測試檔案和文檔

```json
{
  "extra": {
    "strauss": {
      "namespace_prefix": "MyPlugin\\Deps\\",
      "exclude_from_copy": {
        "file_patterns": [
          "/tests?/",
          "/\\.md$/",
          "/LICENSE/",
          "/\\.dist$/",
          "/composer\\.(json|lock)$/",
          "/phpunit/",
          "/\\.github/"
        ]
      }
    }
  }
}
```

### 範例 6: 自定義命名空間替換模式

避免重複的供應商名稱：

```json
{
  "extra": {
    "strauss": {
      "namespace_replacement_patterns": {
        "~BrianHenryIE\\\\(.*)~": "MyCompany\\MyPlugin\\\\$1"
      }
    }
  }
}
```

**效果**:
```php
// 原始
namespace BrianHenryIE\SomePackage;

// 不使用 replacement_patterns (重複):
namespace MyCompany\MyPlugin\BrianHenryIE\SomePackage;

// 使用 replacement_patterns (簡潔):
namespace MyCompany\MyPlugin\SomePackage;
```

### 範例 7: 覆蓋套件的 autoload

處理沒有正確 autoload 的舊套件：

```json
{
  "require": {
    "old/legacy-package": "dev-master"
  },
  "extra": {
    "strauss": {
      "namespace_prefix": "MyPlugin\\Deps\\",
      "override_autoload": {
        "old/legacy-package": {
          "classmap": ["src/", "lib/"]
        }
      }
    }
  }
}
```

### 範例 8: 處理 PSR 介面

PSR 介面通常不應該被前綴化，因為它們是跨套件的標準：

```json
{
  "require": {
    "psr/log": "^1.0",
    "monolog/monolog": "^2.0"
  },
  "extra": {
    "strauss": {
      "namespace_prefix": "MyPlugin\\Deps\\",
      "exclude_from_prefix": {
        "packages": ["psr/log"],
        "namespaces": ["Psr\\Log"]
      }
    }
  }
}
```

**結果**:
- `Psr\Log\LoggerInterface` 保持不變
- `Monolog\Logger` 變成 `MyPlugin\Deps\Monolog\Logger`
- `Monolog\Logger` 仍然可以實作 `Psr\Log\LoggerInterface`

### 範例 9: 前綴全域函數和常數

```json
{
  "require": {
    "ralouphie/getallheaders": "^3.0",
    "symfony/polyfill-mbstring": "^1.0"
  },
  "extra": {
    "strauss": {
      "namespace_prefix": "MyPlugin\\Deps\\",
      "classmap_prefix": "MyPlugin_Deps_",
      "functions_prefix": "myplugin_deps_",
      "constant_prefix": "MYPLUGIN_DEPS_"
    }
  }
}
```

**效果**:
```php
// 原始
function getallheaders() { }
define('MB_CASE_UPPER', 0);

// 變成
function myplugin_deps_getallheaders() { }
define('MYPLUGIN_DEPS_MB_CASE_UPPER', 0);
```

### 範例 10: 更新專案呼叫位置

當你的專案程式碼直接使用依賴類別時：

```json
{
  "require": {
    "guzzlehttp/guzzle": "^7.0"
  },
  "autoload": {
    "psr-4": {
      "MyPlugin\\": "src/"
    },
    "files": ["my-plugin.php"]
  },
  "extra": {
    "strauss": {
      "namespace_prefix": "MyPlugin\\Vendor\\",
      "update_call_sites": ["src", "my-plugin.php"]
    }
  }
}
```

**原始** `src/ApiClient.php`:
```php
<?php
namespace MyPlugin;

use GuzzleHttp\Client;

class ApiClient {
    public function __construct() {
        $this->client = new Client();
    }
}
```

**處理後** `src/ApiClient.php`:
```php
<?php
namespace MyPlugin;

use MyPlugin\Vendor\GuzzleHttp\Client;

class ApiClient {
    public function __construct() {
        $this->client = new Client();
    }
}
```

## 命令列使用

### 乾跑（Dry Run）

預覽變更而不實際修改檔案：

```bash
composer strauss -- --dry-run
```

### 設定詳細程度

```bash
# 靜默模式
composer strauss -- --silent

# 一般訊息（預設）
composer strauss -- --notice

# 詳細訊息
composer strauss -- --info

# 除錯訊息
composer strauss -- --debug
```

### Replace 命令

在專案檔案中進行原地重命名（不複製檔案）：

```bash
strauss replace \
  --from "OldNamespace\\Package" \
  --to "NewNamespace\\Package" \
  --paths "src,includes"
```

### 包含自動載入器

在 `vendor/autoload.php` 中添加 Strauss 自動載入器：

```bash
strauss include-autoloader
```

這會在 `vendor/autoload.php` 添加：
```php
require_once __DIR__ . '/../vendor-prefixed/autoload.php';
```

## 與 CI/CD 整合

### GitHub Actions

```yaml
name: Build Plugin

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2

    - name: Setup PHP
      uses: shivammathur/setup-php@v2
      with:
        php-version: '7.4'

    - name: Install Composer dependencies
      run: composer install --no-dev --optimize-autoloader

    - name: Run Strauss
      run: composer strauss

    - name: Archive plugin
      run: |
        mkdir -p dist
        zip -r dist/my-plugin.zip . -x "*.git*" "node_modules/*" "tests/*"

    - name: Upload artifact
      uses: actions/upload-artifact@v2
      with:
        name: plugin
        path: dist/my-plugin.zip
```

## 除錯技巧

### 檢查生成的 autoload

```bash
cat vendor-prefixed/autoload.php
cat vendor-prefixed/composer/autoload_classmap.php
cat vendor-prefixed/composer/autoload_psr4.php
```

### 驗證前綴是否正確應用

```bash
# 搜尋原始命名空間（不應該存在）
grep -r "namespace Monolog" vendor-prefixed/

# 搜尋前綴後的命名空間（應該存在）
grep -r "namespace MyPlugin\\\\Vendor\\\\Monolog" vendor-prefixed/
```

### 測試自動載入

```php
<?php
require_once __DIR__ . '/vendor-prefixed/autoload.php';

// 測試類別是否可載入
var_dump(class_exists('MyPlugin\\Vendor\\Monolog\\Logger'));
```
