# Strauss 配置選項詳解

## 完整配置示例

```json
{
  "extra": {
    "strauss": {
      "target_directory": "vendor-prefixed",
      "namespace_prefix": "MyPlugin\\Vendor\\",
      "classmap_prefix": "MyPlugin_Vendor_",
      "constant_prefix": "MYPLUGIN_",
      "functions_prefix": "myplugin_",
      "packages": ["vendor/package"],
      "update_call_sites": false,
      "include_root_autoload": false,
      "override_autoload": {},
      "exclude_from_copy": {
        "packages": [],
        "namespaces": [],
        "file_patterns": []
      },
      "exclude_from_prefix": {
        "packages": [],
        "namespaces": [],
        "file_patterns": []
      },
      "namespace_replacement_patterns": {},
      "delete_vendor_packages": false,
      "delete_vendor_files": false,
      "include_modified_date": true,
      "include_author": true
    }
  }
}
```

## 基本配置

### `target_directory`
- **類型**: `string`
- **預設值**: `"vendor-prefixed"`
- **說明**: 複製和前綴化檔案的輸出目錄

```json
{
  "extra": {
    "strauss": {
      "target_directory": "strauss-vendor"
    }
  }
}
```

### `namespace_prefix`
- **類型**: `string`
- **預設值**: 從 PSR-4 autoload 推斷
- **說明**: 要添加到命名空間的前綴

```json
{
  "extra": {
    "strauss": {
      "namespace_prefix": "MyCompany\\MyPlugin\\Dependencies\\"
    }
  }
}
```

**效果**:
```php
// 原始
namespace Vendor\Package;

// 變成
namespace MyCompany\MyPlugin\Dependencies\Vendor\Package;
```

### `classmap_prefix`
- **類型**: `string`
- **預設值**: 從 `namespace_prefix` 轉換而來
- **說明**: 全域類別（無命名空間）的前綴

```json
{
  "extra": {
    "strauss": {
      "classmap_prefix": "MyPlugin_"
    }
  }
}
```

**效果**:
```php
// 原始
class SomeGlobalClass {}

// 變成
class MyPlugin_SomeGlobalClass {}
```

### `constant_prefix`
- **類型**: `string|null`
- **預設值**: `null` (不前綴常數)
- **說明**: `define()` 常數的前綴

```json
{
  "extra": {
    "strauss": {
      "constant_prefix": "MYPLUGIN_"
    }
  }
}
```

**效果**:
```php
// 原始
define('VERSION', '1.0.0');

// 變成
define('MYPLUGIN_VERSION', '1.0.0');
```

### `functions_prefix`
- **類型**: `string|null`
- **預設值**: `null` (不前綴函數)
- **說明**: 全域函數的前綴（建議小寫加底線）

```json
{
  "extra": {
    "strauss": {
      "functions_prefix": "myplugin_"
    }
  }
}
```

**效果**:
```php
// 原始
function helper_function() {}

// 變成
function myplugin_helper_function() {}
```

## 套件選擇

### `packages`
- **類型**: `string[]`
- **預設值**: `[]` (使用所有 require 的套件)
- **說明**: 要處理的套件列表

```json
{
  "require": {
    "vendor/package-a": "*",
    "vendor/package-b": "*",
    "vendor/package-c": "*"
  },
  "extra": {
    "strauss": {
      "packages": [
        "vendor/package-a",
        "vendor/package-b"
      ]
    }
  }
}
```

## 進階配置

### `update_call_sites`
- **類型**: `bool|string[]`
- **預設值**: `false`
- **說明**: 是否更新專案檔案中對前綴類別的呼叫

**選項 1: 使用 autoload 目錄**
```json
{
  "autoload": {
    "psr-4": {
      "MyPlugin\\": "src/"
    },
    "files": ["my-plugin.php"]
  },
  "extra": {
    "strauss": {
      "update_call_sites": true
    }
  }
}
```

**選項 2: 指定路徑**
```json
{
  "extra": {
    "strauss": {
      "update_call_sites": ["src", "includes", "my-plugin.php"]
    }
  }
}
```

**選項 3: 停用**
```json
{
  "extra": {
    "strauss": {
      "update_call_sites": false
    }
  }
}
```

**效果**: 在專案檔案中
```php
// 原始 (在 src/MyClass.php)
use Vendor\Package\SomeClass;
$obj = new SomeClass();

// 變成
use MyPlugin\Vendor\Vendor\Package\SomeClass;
$obj = new SomeClass();
```

### `namespace_replacement_patterns`
- **類型**: `object`
- **預設值**: `{}`
- **說明**: 使用正規表達式進行更複雜的命名空間替換

```json
{
  "extra": {
    "strauss": {
      "namespace_replacement_patterns": {
        "~BrianHenryIE\\\\(.*)~": "MyPlugin\\\\Deps\\\\$1"
      }
    }
  }
}
```

**效果**:
```php
// 原始
namespace BrianHenryIE\SomePackage;

// 變成
namespace MyPlugin\Deps\SomePackage;
```

### `override_autoload`
- **類型**: `object`
- **預設值**: `{}`
- **說明**: 覆蓋套件的 autoload 設定

**使用案例**: 套件沒有 autoload 或 autoload 不正確

```json
{
  "extra": {
    "strauss": {
      "override_autoload": {
        "pear/pear-core-minimal": {
          "classmap": ["src/"]
        },
        "old/package-without-autoload": {
          "psr-4": {
            "Old\\Package\\": "src/"
          }
        }
      }
    }
  }
}
```

## 排除配置

### `exclude_from_copy`
從複製過程中排除檔案

#### `exclude_from_copy.packages`
```json
{
  "extra": {
    "strauss": {
      "exclude_from_copy": {
        "packages": ["vendor/unwanted-package"]
      }
    }
  }
}
```

#### `exclude_from_copy.namespaces`
```json
{
  "extra": {
    "strauss": {
      "exclude_from_copy": {
        "namespaces": ["Vendor\\Package\\Tests"]
      }
    }
  }
}
```

#### `exclude_from_copy.file_patterns`
```json
{
  "extra": {
    "strauss": {
      "exclude_from_copy": {
        "file_patterns": [
          "/tests?/",
          "/\\.md$/",
          "/^.*\\.dist$/"
        ]
      }
    }
  }
}
```

### `exclude_from_prefix`
複製檔案但不添加前綴

#### `exclude_from_prefix.packages`
```json
{
  "extra": {
    "strauss": {
      "exclude_from_prefix": {
        "packages": ["psr/log"]
      }
    }
  }
}
```

**使用案例**: PSR 介面通常不應該前綴化，因為多個套件可能實作相同介面

#### `exclude_from_prefix.namespaces`
```json
{
  "extra": {
    "strauss": {
      "exclude_from_prefix": {
        "namespaces": ["Psr\\Log"]
      }
    }
  }
}
```

#### `exclude_from_prefix.file_patterns`
```json
{
  "extra": {
    "strauss": {
      "exclude_from_prefix": {
        "file_patterns": ["/^psr.*$/"]
      }
    }
  }
}
```

## 清理配置

### `delete_vendor_packages`
- **類型**: `bool`
- **預設值**: `false`
- **說明**: 處理後刪除原始 vendor 套件目錄

```json
{
  "extra": {
    "strauss": {
      "delete_vendor_packages": true
    }
  }
}
```

**注意**: 這是破壞性操作，建議只在確定不需要原始檔案時使用

### `delete_vendor_files`
- **類型**: `bool`
- **預設值**: `false`
- **說明**: 處理後刪除已複製的個別檔案

```json
{
  "extra": {
    "strauss": {
      "delete_vendor_files": true
    }
  }
}
```

## 自動載入配置

### `include_root_autoload`
- **類型**: `bool`
- **預設值**: `false`
- **說明**: 在 Strauss 自動載入器中包含專案的 autoload

```json
{
  "extra": {
    "strauss": {
      "include_root_autoload": true
    }
  }
}
```

**使用案例**: 只使用 Strauss 自動載入器，不使用 Composer 的自動載入器

```php
// 只需要一個 require
require_once __DIR__ . '/vendor-prefixed/autoload.php';
// 無需 require __DIR__ . '/vendor/autoload.php';
```

## 文件標頭配置

### `include_modified_date`
- **類型**: `bool`
- **預設值**: `true`
- **說明**: 在修改的檔案標頭中包含修改日期

### `include_author`
- **類型**: `bool`
- **預設值**: `true`
- **說明**: 在修改的檔案標頭中包含作者名稱

```json
{
  "extra": {
    "strauss": {
      "include_modified_date": false,
      "include_author": false
    }
  }
}
```

## 向後兼容 (Mozart)

Strauss 也讀取 Mozart 配置以便無縫遷移：

```json
{
  "extra": {
    "mozart": {
      "dep_directory": "strauss",
      "dep_namespace": "MyPlugin\\",
      "classmap_directory": "strauss",
      "classmap_prefix": "MyPlugin_",
      "delete_vendor_files": true
    }
  }
}
```

映射關係:
- `dep_directory` → `target_directory`
- `dep_namespace` → `namespace_prefix`
- `exclude_packages` → `excludePackages`
