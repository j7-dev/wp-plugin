# Strauss 實際使用情境

## 情境 1: WordPress 外掛開發 - 避免依賴衝突

### 問題描述

你正在開發一個 WordPress 外掛，使用了 Guzzle HTTP 客戶端。但是使用者網站上可能已經有其他外掛也使用 Guzzle，且版本不同。

### 解決方案

```json
{
  "name": "mycompany/wp-api-integration",
  "description": "WordPress plugin that integrates with external API",
  "require": {
    "guzzlehttp/guzzle": "^7.0",
    "monolog/monolog": "^2.0"
  },
  "autoload": {
    "psr-4": {
      "MyCompany\\ApiIntegration\\": "src/"
    }
  },
  "extra": {
    "strauss": {
      "namespace_prefix": "MyCompany\\ApiIntegration\\Vendor\\",
      "classmap_prefix": "MyCompany_ApiIntegration_",
      "update_call_sites": true,
      "exclude_from_prefix": {
        "packages": ["psr/log"]
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

**主檔案** `wp-api-integration.php`:
```php
<?php
/**
 * Plugin Name: API Integration
 * Version: 1.0.0
 */

require_once __DIR__ . '/vendor-prefixed/autoload.php';

use MyCompany\ApiIntegration\Vendor\GuzzleHttp\Client;
use MyCompany\ApiIntegration\Vendor\Monolog\Logger;

class ApiIntegration {
    private $client;
    private $logger;

    public function __construct() {
        $this->client = new Client([
            'base_uri' => 'https://api.example.com'
        ]);
        $this->logger = new Logger('api-integration');
    }
}
```

### 結果

即使使用者安裝了另一個使用 Guzzle 6.x 的外掛，你的外掛使用的是 `MyCompany\ApiIntegration\Vendor\GuzzleHttp\Client`，完全獨立，不會衝突。

## 情境 2: 大型專案 - 減少體積

### 問題描述

你的專案使用了 Symfony 組件，但打包後發現體積過大，包含了大量測試檔案和文檔。

### 解決方案

```json
{
  "require": {
    "symfony/http-foundation": "^5.0",
    "symfony/routing": "^5.0"
  },
  "extra": {
    "strauss": {
      "namespace_prefix": "MyApp\\Deps\\",
      "exclude_from_copy": {
        "file_patterns": [
          "/[Tt]ests?/",
          "/\\.md$/",
          "/\\.rst$/",
          "/LICENSE/",
          "/CHANGELOG/",
          "/\\.dist$/",
          "/phpunit/",
          "/\\.github/",
          "/composer\\.(json|lock)$/",
          "/.editorconfig/",
          "/.php[-_]cs/",
          "/psalm/",
          "/phpstan/"
        ]
      }
    }
  }
}
```

### 驗證

```bash
# 執行前
du -sh vendor/
# 輸出: 45M

composer install
composer strauss

# 執行後
du -sh vendor-prefixed/
# 輸出: 12M  (減少 73%)
```

## 情境 3: 遺留程式碼 - 處理沒有 Autoload 的套件

### 問題描述

你需要使用一個舊的 PEAR 套件，它沒有 Composer autoload 設定。

### 解決方案

```json
{
  "require": {
    "pear/pear-core-minimal": "v1.10.10"
  },
  "extra": {
    "strauss": {
      "namespace_prefix": "MyApp\\Deps\\",
      "classmap_prefix": "MyApp_Deps_",
      "override_autoload": {
        "pear/pear-core-minimal": {
          "classmap": ["src/"]
        }
      }
    }
  }
}
```

### 結果

Strauss 會掃描 `src/` 目錄下的所有 PHP 檔案，找到類別並建立 classmap，然後添加前綴。

## 情境 4: 多環境部署 - 開發與生產分離

### 問題描述

開發時需要所有依賴（包括測試工具），但生產環境只需要前綴化的依賴。

### 解決方案

```json
{
  "require": {
    "guzzlehttp/guzzle": "^7.0",
    "monolog/monolog": "^2.0"
  },
  "require-dev": {
    "phpunit/phpunit": "^9.0",
    "mockery/mockery": "^1.0"
  },
  "extra": {
    "strauss": {
      "namespace_prefix": "MyApp\\Deps\\",
      "delete_vendor_packages": true,
      "include_root_autoload": true
    }
  }
}
```

**開發環境**:
```bash
composer install
# vendor/ 包含所有依賴
# vendor-prefixed/ 包含前綴化的 require 依賴
```

**生產部署腳本**:
```bash
#!/bin/bash
composer install --no-dev --optimize-autoloader
composer strauss

# 現在 vendor/ 已被刪除（delete_vendor_packages: true）
# 只有 vendor-prefixed/ 存在
```

**應用程式入口**:
```php
<?php
// 生產環境只需要一個 autoloader
require_once __DIR__ . '/vendor-prefixed/autoload.php';
```

## 情境 5: 微服務架構 - 共享 PSR 介面

### 問題描述

多個微服務共享相同的 PSR Logger 介面，需要確保介面不被前綴化以便互通。

### 解決方案

**服務 A**:
```json
{
  "require": {
    "psr/log": "^1.0",
    "monolog/monolog": "^2.0"
  },
  "extra": {
    "strauss": {
      "namespace_prefix": "ServiceA\\Deps\\",
      "exclude_from_prefix": {
        "packages": ["psr/log"],
        "namespaces": ["Psr\\Log"]
      }
    }
  }
}
```

**服務 B**:
```json
{
  "require": {
    "psr/log": "^1.0",
    "different/logger": "^1.0"
  },
  "extra": {
    "strauss": {
      "namespace_prefix": "ServiceB\\Deps\\",
      "exclude_from_prefix": {
        "packages": ["psr/log"],
        "namespaces": ["Psr\\Log"]
      }
    }
  }
}
```

### 結果

兩個服務都使用原始的 `Psr\Log\LoggerInterface`，可以相互傳遞 logger 實例：

```php
// 服務 A
use Psr\Log\LoggerInterface;
use ServiceA\Deps\Monolog\Logger;

class ServiceA {
    public function getLogger(): LoggerInterface {
        return new Logger('service-a');
    }
}

// 服務 B 可以接收
use Psr\Log\LoggerInterface;

class ServiceB {
    public function setLogger(LoggerInterface $logger) {
        // 可以接收來自服務 A 的 logger
        $this->logger = $logger;
    }
}
```

## 情境 6: CLI 工具 - 打包為 PHAR

### 問題描述

開發一個 CLI 工具，需要打包成單一 PHAR 檔案，但要避免與使用者專案的依賴衝突。

### 解決方案

**composer.json**:
```json
{
  "name": "mycompany/cli-tool",
  "bin": ["bin/my-tool"],
  "require": {
    "symfony/console": "^5.0",
    "guzzlehttp/guzzle": "^7.0"
  },
  "autoload": {
    "psr-4": {
      "MyCompany\\CliTool\\": "src/"
    }
  },
  "extra": {
    "strauss": {
      "namespace_prefix": "MyCompany\\CliTool\\Deps\\",
      "target_directory": "vendor-prefixed",
      "delete_vendor_packages": true,
      "include_root_autoload": true
    }
  }
}
```

**box.json** (使用 box 打包):
```json
{
  "main": "bin/my-tool",
  "directories": [
    "src",
    "vendor-prefixed"
  ],
  "output": "my-tool.phar",
  "compression": "GZ",
  "stub": true
}
```

**打包腳本**:
```bash
#!/bin/bash
set -e

# 安裝依賴
composer install --no-dev --optimize-autoloader

# 前綴化
composer strauss

# 打包
box compile

echo "PHAR created: my-tool.phar"
```

**bin/my-tool**:
```php
#!/usr/bin/env php
<?php

// 只需要載入前綴化的 autoloader
require __DIR__ . '/../vendor-prefixed/autoload.php';

use MyCompany\CliTool\Deps\Symfony\Component\Console\Application;
use MyCompany\CliTool\Command\MyCommand;

$app = new Application('My Tool', '1.0.0');
$app->add(new MyCommand());
$app->run();
```

## 情境 7: 外掛市場 - 動態命名空間

### 問題描述

你在開發一個外掛框架，允許第三方開發者建立擴充外掛。每個外掛可能使用相同的依賴但版本不同。

### 解決方案

**外掛 A** (composer.json):
```json
{
  "name": "vendor-a/plugin-a",
  "require": {
    "guzzlehttp/guzzle": "^6.0"
  },
  "extra": {
    "strauss": {
      "namespace_prefix": "VendorA\\PluginA\\Deps\\",
      "classmap_prefix": "VendorA_PluginA_"
    }
  }
}
```

**外掛 B** (composer.json):
```json
{
  "name": "vendor-b/plugin-b",
  "require": {
    "guzzlehttp/guzzle": "^7.0"
  },
  "extra": {
    "strauss": {
      "namespace_prefix": "VendorB\\PluginB\\Deps\\",
      "classmap_prefix": "VendorB_PluginB_"
    }
  }
}
```

### 最佳實踐建議

為確保唯一的前綴，使用外掛供應商名稱和外掛名稱的組合：

```php
// 生成前綴的 helper
function generatePrefix($vendorName, $pluginName) {
    $prefix = str_replace(['-', '_'], '', ucwords($vendorName, '-_'));
    $prefix .= '\\';
    $prefix .= str_replace(['-', '_'], '', ucwords($pluginName, '-_'));
    $prefix .= '\\Deps\\';
    return $prefix;
}

// 範例
echo generatePrefix('vendor-a', 'my-plugin');
// 輸出: VendorA\MyPlugin\Deps\
```

## 情境 8: 測試環境 - Mock 前綴化類別

### 問題描述

在單元測試中需要 mock 已前綴化的類別。

### 解決方案

**測試設定**:
```php
// tests/bootstrap.php
<?php

// 載入 Composer autoloader (包含 PHPUnit, Mockery 等)
require_once __DIR__ . '/../vendor/autoload.php';

// 載入前綴化的依賴
require_once __DIR__ . '/../vendor-prefixed/autoload.php';
```

**測試類別**:
```php
<?php
use PHPUnit\Framework\TestCase;
use Mockery;
use MyPlugin\Deps\GuzzleHttp\ClientInterface;

class ApiClientTest extends TestCase
{
    public function tearDown(): void
    {
        Mockery::close();
    }

    public function testMakesApiCall()
    {
        // Mock 前綴化的介面
        $mockClient = Mockery::mock(ClientInterface::class);
        $mockClient->shouldReceive('request')
            ->once()
            ->with('GET', '/api/endpoint')
            ->andReturn(new \MyPlugin\Deps\GuzzleHttp\Psr7\Response(200));

        $apiClient = new ApiClient($mockClient);
        $result = $apiClient->fetchData();

        $this->assertNotNull($result);
    }
}
```

**專案類別** (使用依賴注入):
```php
<?php
namespace MyPlugin;

use MyPlugin\Deps\GuzzleHttp\ClientInterface;

class ApiClient
{
    private $httpClient;

    public function __construct(ClientInterface $httpClient)
    {
        $this->httpClient = $httpClient;
    }

    public function fetchData()
    {
        $response = $this->httpClient->request('GET', '/api/endpoint');
        return json_decode($response->getBody(), true);
    }
}
```

## 情境 9: CI/CD 優化 - 快取 Strauss 輸出

### 問題描述

在 CI/CD 流程中，每次都執行 Strauss 很耗時。

### 解決方案

**GitHub Actions**:
```yaml
name: Build and Test

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2

    - name: Get Composer Cache Directory
      id: composer-cache
      run: echo "::set-output name=dir::$(composer config cache-files-dir)"

    - name: Cache Composer dependencies
      uses: actions/cache@v2
      with:
        path: ${{ steps.composer-cache.outputs.dir }}
        key: ${{ runner.os }}-composer-${{ hashFiles('**/composer.lock') }}
        restore-keys: |
          ${{ runner.os }}-composer-

    - name: Cache Strauss output
      uses: actions/cache@v2
      with:
        path: vendor-prefixed
        key: ${{ runner.os }}-strauss-${{ hashFiles('**/composer.lock') }}
        restore-keys: |
          ${{ runner.os }}-strauss-

    - name: Install dependencies
      run: composer install --prefer-dist --no-progress

    - name: Run Strauss (if cache miss)
      run: |
        if [ ! -d "vendor-prefixed" ]; then
          composer strauss
        fi

    - name: Run tests
      run: vendor/bin/phpunit
```

### 結果

- 首次執行: 完整安裝和 Strauss 處理
- 後續執行 (composer.lock 未變): 使用快取，跳過 Strauss
- 節省時間: 30-60 秒/次建置

## 情境 10: 外掛升級 - 平滑遷移

### 問題描述

你的外掛之前沒有使用 Strauss，現在要升級以避免衝突，但要確保向後兼容。

### 解決方案

**階段 1: 雙軌並行** (v2.0.0)
```json
{
  "version": "2.0.0",
  "require": {
    "guzzlehttp/guzzle": "^7.0"
  },
  "extra": {
    "strauss": {
      "namespace_prefix": "MyPlugin\\Vendor\\"
    }
  }
}
```

**主檔案** (my-plugin.php):
```php
<?php
/**
 * Version: 2.0.0
 */

// 載入舊的 autoloader (向後兼容)
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require_once __DIR__ . '/vendor/autoload.php';
}

// 載入新的前綴化 autoloader
require_once __DIR__ . '/vendor-prefixed/autoload.php';

// 新程式碼使用前綴化版本
use MyPlugin\Vendor\GuzzleHttp\Client as PrefixedClient;

// 檢測並使用前綴化版本
if (class_exists('MyPlugin\\Vendor\\GuzzleHttp\\Client')) {
    $client = new PrefixedClient();
} else {
    // Fallback 到舊版本（向後兼容）
    $client = new \GuzzleHttp\Client();
}
```

**階段 2: 完全遷移** (v3.0.0)
```json
{
  "version": "3.0.0",
  "extra": {
    "strauss": {
      "namespace_prefix": "MyPlugin\\Vendor\\",
      "delete_vendor_packages": true,
      "update_call_sites": true
    }
  }
}
```

**升級通知**:
```php
// 在外掛啟用時檢查
register_activation_hook(__FILE__, function() {
    $old_autoloader = __DIR__ . '/vendor/autoload.php';

    if (file_exists($old_autoloader)) {
        add_action('admin_notices', function() {
            echo '<div class="notice notice-warning">';
            echo '<p>MyPlugin v3.0 requires re-installation. Please deactivate and re-activate the plugin.</p>';
            echo '</div>';
        });
    }
});
```

這些情境展示了 Strauss 在各種實際場景中的應用，從簡單的外掛開發到複雜的企業級部署。
