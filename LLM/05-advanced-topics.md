# Strauss 進階主題

## 內部架構深入解析

### Pipeline 執行順序

Strauss 的核心是一個 Pipeline 架構，按特定順序執行各個處理階段：

```
1. DependenciesEnumerator
   └─> 解析 composer.json 和 composer.lock
       取得所有需要處理的套件

2. FileEnumerator
   └─> 掃描每個套件的檔案
       建立 DiscoveredFiles 集合
       決定來源路徑和目標路徑

3. FileCopyScanner
   └─> 標記哪些檔案應該被複製
       應用 exclude_from_copy 規則

4. Copier
   └─> 實際複製檔案
       prepareTarget() - 清理舊檔案
       copy() - 執行複製

5. AutoloadedFilesEnumerator
   └─> 處理 'files' 類型的 autoload
       這些檔案需要直接 require

6. FileSymbolScanner
   └─> 使用 PHP-Parser 掃描 PHP 檔案
       發現類別、介面、特性、函數、常數、命名空間
       建立 DiscoveredSymbols 集合

7. MarkSymbolsForRenaming
   └─> 應用 exclude_from_prefix 規則
       標記哪些符號不應該被重命名

8. ChangeEnumerator
   └─> 決定每個符號的替換值
       應用 namespace_prefix
       應用 classmap_prefix
       應用 functions_prefix
       應用 constants_prefix
       應用 namespace_replacement_patterns

9. Prefixer
   └─> 執行實際的程式碼修改
       使用 PHP-Parser 修改 AST
       重新生成 PHP 程式碼

10. Licenser
    └─> 更新檔案標頭
        添加修改聲明
        保留原始授權資訊

11. Autoload/DumpAutoload
    └─> 使用 Composer 工具生成 autoload 檔案
        生成 autoload.php
        生成 autoload_classmap.php
        生成 autoload_psr4.php
        生成 autoload_files.php

12. Aliases (如果 delete_vendor_packages 啟用)
    └─> 生成類別別名對照表
        vendor/composer/autoload_aliases.php
        用於開發時載入舊類別名稱

13. Cleanup
    └─> 刪除原始檔案 (如果設定)
        delete_vendor_files
        delete_vendor_packages
```

## PHP-Parser 的使用

### AST 修改範例

Strauss 使用 `nikic/php-parser` 來解析和修改 PHP 程式碼。

**原始程式碼**:
```php
<?php
namespace Vendor\Package;

use Other\Package\Class;

class MyClass {
    public function test() {
        return new Class();
    }
}
```

**AST 處理流程**:
```php
// 1. 解析成 AST
$parser = (new ParserFactory)->create(ParserFactory::PREFER_PHP7);
$ast = $parser->parse($code);

// 2. 遍歷和修改 AST
$traverser = new NodeTraverser();
$traverser->addVisitor(new NamespaceReplacer($discoveredSymbols));
$modifiedAst = $traverser->traverse($ast);

// 3. 重新生成程式碼
$prettyPrinter = new Standard();
$newCode = $prettyPrinter->prettyPrintFile($modifiedAst);
```

**修改後**:
```php
<?php
namespace MyPlugin\Deps\Vendor\Package;

use MyPlugin\Deps\Other\Package\Class;

class MyClass {
    public function test() {
        return new Class();
    }
}
```

### NodeVisitor 範例

Strauss 內部實現了多個 NodeVisitor：

```php
// src/Pipeline/Prefixer.php 中的部分邏輯

class NamespaceReplacer extends NodeVisitorAbstract
{
    public function enterNode(Node $node)
    {
        // 修改 namespace 宣告
        if ($node instanceof Node\Stmt\Namespace_) {
            $originalNamespace = $node->name->toString();
            $newNamespace = $this->getReplacementNamespace($originalNamespace);
            $node->name = new Node\Name($newNamespace);
        }

        // 修改 use 語句
        if ($node instanceof Node\Stmt\Use_) {
            foreach ($node->uses as $use) {
                $originalName = $use->name->toString();
                $newName = $this->getReplacementName($originalName);
                $use->name = new Node\Name($newName);
            }
        }

        // 修改類別實例化
        if ($node instanceof Node\Expr\New_) {
            if ($node->class instanceof Node\Name) {
                $originalName = $node->class->toString();
                $newName = $this->getReplacementName($originalName);
                $node->class = new Node\Name($newName);
            }
        }

        return $node;
    }
}
```

## DiscoveredSymbols 資料結構

### 符號類型

Strauss 追蹤以下符號類型：

```php
// ClassSymbol
class ClassSymbol extends DiscoveredSymbol {
    protected string $namespace;
    protected string $originalSymbol;  // 完整類別名稱
    protected string $replacement;      // 前綴後的名稱
    protected bool $doRename = true;
}

// NamespaceSymbol
class NamespaceSymbol extends DiscoveredSymbol {
    protected string $originalSymbol;  // Vendor\Package
    protected string $replacement;      // MyPlugin\Deps\Vendor\Package
}

// FunctionSymbol
class FunctionSymbol extends DiscoveredSymbol {
    protected string $namespace;        // 函數所在命名空間
    protected string $originalSymbol;   // 函數名稱
    protected string $replacement;      // 前綴後的名稱
}

// ConstantSymbol
class ConstantSymbol extends DiscoveredSymbol {
    protected string $originalSymbol;   // CONSTANT_NAME
    protected string $replacement;      // PREFIX_CONSTANT_NAME
}
```

### 範例資料流

```php
// 掃描後
$discoveredSymbols = [
    'namespaces' => [
        'Monolog' => NamespaceSymbol(
            original: 'Monolog',
            replacement: 'MyPlugin\Deps\Monolog'
        ),
        'Monolog\Handler' => NamespaceSymbol(
            original: 'Monolog\Handler',
            replacement: 'MyPlugin\Deps\Monolog\Handler'
        )
    ],
    'classes' => [
        'Monolog\Logger' => ClassSymbol(
            namespace: 'Monolog',
            original: 'Monolog\Logger',
            replacement: 'MyPlugin\Deps\Monolog\Logger'
        )
    ],
    'functions' => [
        'helper_function' => FunctionSymbol(
            namespace: '\\',
            original: 'helper_function',
            replacement: 'myplugin_helper_function'
        )
    ]
];
```

## 自動載入器生成

### Composer 的 ClassLoader

Strauss 重用 Composer 的 `ClassLoader` 類別：

```php
// vendor-prefixed/autoload.php
<?php

// 這個檔案由 Strauss 生成
// @generated by BrianHenryIE/strauss

require_once __DIR__ . '/composer/autoload_real.php';

return ComposerAutoloaderInit123456::getLoader();
```

### Autoload 檔案結構

```
vendor-prefixed/
├── autoload.php                        # 主要入口
└── composer/
    ├── autoload_real.php               # 初始化邏輯
    ├── autoload_classmap.php           # Classmap 對照表
    ├── autoload_psr4.php               # PSR-4 對照表
    ├── autoload_files.php              # Files autoload
    ├── autoload_static.php             # 靜態優化版本
    ├── ClassLoader.php                 # Composer 的 ClassLoader
    └── LICENSE                         # Composer 授權
```

### ClassLoader 互動

```php
// 載入 Strauss autoloader
$loader = require __DIR__ . '/vendor-prefixed/autoload.php';

// $loader 是 Composer\Autoload\ClassLoader 實例
// 可以額外註冊類別
$loader->addPsr4('MyNamespace\\', __DIR__ . '/src');

// 或設定回調
$loader->addClassMap([
    'MyClass' => __DIR__ . '/includes/MyClass.php'
]);
```

## 處理邊緣案例

### 動態類別名稱

**問題**: Strauss 只能處理靜態可分析的程式碼。

```php
// ✅ 可以處理
$obj = new Vendor\Package\Class();

// ❌ 無法處理
$className = 'Vendor\Package\Class';
$obj = new $className();

// ❌ 無法處理
$obj = new $_GET['class']();
```

**解決方案**: 在專案程式碼中手動處理：

```php
// 在你的程式碼中
$classMap = [
    'Vendor\Package\Class' => 'MyPlugin\Deps\Vendor\Package\Class',
];

$className = $classMap[$originalClassName] ?? $originalClassName;
$obj = new $className();
```

### 字串中的類別名稱

**問題**: 字串內容不會被修改。

```php
// 這不會被修改
$className = "Vendor\\Package\\Class";
$reflection = new ReflectionClass($className);
```

**解決方案 1**: 使用 `::class` 常數
```php
// 這會被正確處理
use Vendor\Package\Class;
$className = Class::class;
$reflection = new ReflectionClass($className);
```

**解決方案 2**: 使用 `update_call_sites`
當啟用時，Strauss 會嘗試更新專案檔案中的這些引用。

### 條件式 class_alias

某些套件使用 `class_alias` 提供向後兼容：

```php
namespace Vendor\Package;

class NewClass {}

// 向後兼容
if (!class_exists('OldClass')) {
    class_alias(NewClass::class, 'OldClass');
}
```

**Strauss 處理**:
```php
namespace MyPlugin\Deps\Vendor\Package;

class NewClass {}

// class_alias 也會被更新
if (!class_exists('MyPlugin_Deps_OldClass')) {
    class_alias(NewClass::class, 'MyPlugin_Deps_OldClass');
}
```

## 效能考量

### 檔案數量對效能的影響

大型套件（如 Symfony 組件）可能包含數千個檔案：

```bash
# 測量執行時間
time composer strauss
```

### 優化建議

1. **排除不需要的檔案**:
```json
{
  "exclude_from_copy": {
    "file_patterns": [
      "/[Tt]ests?/",
      "/[Dd]ocs?/",
      "/[Ee]xamples?/"
    ]
  }
}
```

2. **使用 --no-dev**:
```bash
composer install --no-dev
composer strauss
```

3. **快取策略**: 在 CI/CD 中快取 `vendor-prefixed/`
```yaml
# GitHub Actions 範例
- uses: actions/cache@v2
  with:
    path: vendor-prefixed
    key: strauss-${{ hashFiles('**/composer.lock') }}
```

## 與其他工具整合

### PHP-Scoper 比較

| 特性 | Strauss | PHP-Scoper |
|------|---------|------------|
| 命名空間前綴 | ✅ | ✅ |
| 類別前綴 | ✅ | ✅ |
| 函數前綴 | ✅ | ✅ |
| 常數前綴 | ✅ | ✅ |
| 配置複雜度 | 低 | 中 |
| 執行速度 | 快 | 中 |
| WordPress 優化 | ✅ | ❌ |
| Polyfill 處理 | ✅ | 需要配置 |

**何時使用 Strauss**:
- WordPress 外掛/主題
- 需要簡單配置
- 處理 Mozart 遺留專案

**何時使用 PHP-Scoper**:
- 需要更細緻的控制
- 複雜的排除規則
- PHAR 打包

### 與 PHAR 打包整合

雖然 Strauss 不直接產生 PHAR，但可以配合使用：

```bash
# 1. 安裝依賴和前綴化
composer install --no-dev
composer strauss

# 2. 使用 box 打包
box compile
```

**box.json** 配置:
```json
{
  "directories": [
    "src",
    "vendor-prefixed"
  ],
  "files": [
    "my-cli.php"
  ],
  "main": "my-cli.php",
  "output": "my-cli.phar"
}
```

## 測試策略

### 測試前綴化是否正確

```php
// tests/StraussTest.php
class StraussTest extends TestCase
{
    public function testNamespacePrefixApplied()
    {
        // 載入前綴化的類別
        require_once __DIR__ . '/../vendor-prefixed/autoload.php';

        // 確認新類別存在
        $this->assertTrue(
            class_exists('MyPlugin\\Deps\\Monolog\\Logger')
        );

        // 確認舊類別不存在（在生產環境）
        $this->assertFalse(
            class_exists('Monolog\\Logger')
        );
    }

    public function testCanInstantiateClass()
    {
        $logger = new \MyPlugin\Deps\Monolog\Logger('test');
        $this->assertInstanceOf(
            \MyPlugin\Deps\Monolog\Logger::class,
            $logger
        );
    }
}
```

### 測試自動載入

```php
public function testAutoloadWorks()
{
    $loader = require __DIR__ . '/../vendor-prefixed/autoload.php';

    $this->assertInstanceOf(
        \Composer\Autoload\ClassLoader::class,
        $loader
    );

    // 測試能否載入類別
    $className = 'MyPlugin\\Deps\\Vendor\\Package\\Class';
    $this->assertTrue(class_exists($className));
}
```

## 除錯技巧

### 啟用詳細日誌

```bash
composer strauss -- --debug 2>&1 | tee strauss-debug.log
```

### 檢查符號發現

```bash
# 搜尋特定類別是否被發現
grep "Found.*YourClass" strauss-debug.log

# 檢查命名空間替換
grep "Namespace.*changed" strauss-debug.log
```

### 驗證 AST 修改

在 Prefixer 中添加除錯輸出：

```php
// 臨時修改 src/Pipeline/Prefixer.php
$oldCode = $this->prettyPrinter->prettyPrintFile($ast);
$newCode = $this->prettyPrinter->prettyPrintFile($modifiedAst);

if ($oldCode !== $newCode) {
    file_put_contents(
        '/tmp/strauss-diff-' . basename($file) . '.diff',
        "--- Original\n+++ Modified\n" .
        $this->diff($oldCode, $newCode)
    );
}
```

### 比較原始和前綴化檔案

```bash
# 使用 diff 工具
diff -u \
  vendor/monolog/monolog/src/Monolog/Logger.php \
  vendor-prefixed/monolog/monolog/src/Monolog/Logger.php
```

## 客製化 Strauss

### 擴展配置

建立自己的配置處理器：

```php
class MyStraussConfig extends StraussConfig
{
    protected array $myCustomSetting = [];

    public function getMyCustomSetting(): array
    {
        return $this->myCustomSetting;
    }
}
```

### 添加自定義 Pipeline 步驟

```php
// 在 DependenciesCommand 中
public function execute(InputInterface $input, OutputInterface $output): int
{
    // ... 現有的 pipeline ...

    // 添加自定義步驟
    $myCustomStep = new MyCustomProcessor($config, $filesystem);
    $myCustomStep->process($discoveredFiles, $discoveredSymbols);

    // ... 繼續 pipeline ...
}
```

### Hook 到 Composer Events

```json
{
  "scripts": {
    "pre-strauss": [
      "echo 'Running pre-strauss tasks...'"
    ],
    "strauss": [
      "@pre-strauss",
      "strauss",
      "@post-strauss"
    ],
    "post-strauss": [
      "echo 'Running post-strauss tasks...'",
      "@composer dump-autoload"
    ]
  }
}
```
