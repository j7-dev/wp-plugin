# Strauss 概覽

## 什麼是 Strauss？

Strauss 是一個 PHP 命名空間重命名工具，用於避免 PHP 套件間的自動載入衝突。它會：

1. **複製** vendor 套件到目標目錄
2. **添加前綴** 到命名空間、類別名稱、函數和常數
3. **生成自動載入器** 讓修改後的程式碼能正常運作
4. **更新呼叫位置**（可選）讓專案程式碼使用新的前綴名稱

## 核心概念

### Pipeline 架構

Strauss 使用管道（Pipeline）架構處理檔案：

```
DependenciesCommand
    ↓
FileEnumerator → 掃描要處理的檔案
    ↓
FileCopyScanner → 標記哪些檔案要複製
    ↓
Copier → 複製檔案到目標目錄
    ↓
FileSymbolScanner → 掃描符號（類別、函數、常數等）
    ↓
MarkSymbolsForRenaming → 標記要重命名的符號
    ↓
ChangeEnumerator → 決定替換規則
    ↓
Prefixer → 執行實際的前綴替換
    ↓
Licenser → 更新授權標頭
    ↓
Autoload → 生成自動載入器
    ↓
Cleanup → 清理（可選：刪除原始套件）
```

## 主要組件

### 1. **FileEnumerator** (`src/Pipeline/FileEnumerator.php`)
- 掃描依賴套件，建立檔案清單
- 決定每個檔案的來源路徑和目標路徑

### 2. **Copier** (`src/Pipeline/Copier.php`)
- 複製檔案從 vendor 到目標目錄
- 準備目標目錄（刪除舊檔案）

### 3. **FileSymbolScanner** (`src/Pipeline/FileSymbolScanner.php`)
- 使用 PHP-Parser 掃描 PHP 檔案
- 發現類別、介面、特性、函數、常數、命名空間

### 4. **ChangeEnumerator** (`src/Pipeline/ChangeEnumerator.php`)
- 決定每個符號的替換規則
- 應用 `namespace_prefix`、`classmap_prefix`、`functions_prefix`、`constants_prefix`
- 處理 `namespace_replacement_patterns`

### 5. **Prefixer** (`src/Pipeline/Prefixer.php`)
- 執行實際的程式碼修改
- 使用 PHP-Parser 解析、修改、重新生成程式碼
- 處理命名空間、use 語句、類別名稱、函數呼叫等

### 6. **Autoload** (`src/Pipeline/Autoload.php`)
- 使用 Composer 工具生成自動載入檔案
- 創建 `autoload.php`、`autoload_classmap.php` 等

## 設定物件

**StraussConfig** (`src/Composer/Extra/StraussConfig.php`)
- 從 `composer.json` 的 `extra.strauss` 讀取設定
- 實作多個設定介面（Config Interfaces）
- 提供預設值和推斷邏輯

## 命令

### 1. **dependencies** (預設命令)
處理專案的所有依賴套件，進行複製和前綴化。

### 2. **replace**
在指定檔案中進行原地重命名（不複製檔案）。

### 3. **include-autoloader**
在 `vendor/autoload.php` 中添加一行來載入 Strauss 自動載入器。
