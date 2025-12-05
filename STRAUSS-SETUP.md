# Strauss 前綴化設定說明

## 已完成配置

本專案已使用 Strauss 為 vendor 套件添加命名空間前綴，避免與其他外掛衝突。

### 配置詳情

- **前綴化目錄**: `vendor-prefixed/`
- **命名空間前綴**: `J7\WpPlugin\Dependencies\`
- **類別前綴**: `J7_WpPlugin_`
- **常數前綴**: `J7_WPPLUGIN_`
- **函數前綴**: `j7_wpplugin_`

### 前綴化的套件

- `j7-dev/wp-utils` - WordPress 工具類庫
- `j7-dev/tgm-plugin-activation-forked` - 外掛依賴管理
- `yahnis-elsts/plugin-update-checker` - 外掛更新檢查器
- `j7-dev/wp-plugin-trait` - WordPress 外掛 Traits

### 自動執行

Strauss 已配置為在以下時機自動執行：
```bash
composer install  # 安裝依賴後自動執行
composer update   # 更新依賴後自動執行
composer strauss  # 手動執行
```

### 可用的 Composer 命令

```bash
# 手動執行完整流程（清理 + 前綴化）
composer strauss

# 只清理有問題的目錄
composer strauss:clean

# 只執行 Strauss（不清理）
composer strauss:run
```

**注意**：所有命令都會自動在 WSL 環境中執行，無需手動切換！

### 安裝新依賴時

當你安裝新的依賴時，Strauss 會自動執行：

```bash
# 安裝新依賴（會自動執行 strauss）
composer require vendor/package-name

# 更新依賴（會自動執行 strauss）
composer update

# 如果需要手動重新執行
composer strauss
```

### 使用方式

原本的命名空間：
```php
use J7\WpUtils\Traits\SingletonTrait;
```

現在使用前綴化的命名空間：
```php
use J7\WpPlugin\Dependencies\J7\WpUtils\Traits\SingletonTrait;
```

### 已更新的文件

- `plugin.php` - 添加 vendor-prefixed autoload
- `inc/classes/Bootstrap.php` - 更新為使用前綴化的 trait
- `composer.json` - 添加 Strauss 配置和腳本

### 注意事項

1. **examples 目錄已排除**: 因為包含不完整的程式碼範例，已從處理中排除
2. **vendor-prefixed 目錄**: 這個目錄會在每次執行 composer install/update 時重新生成
3. **路徑問題**: 在 Windows 環境執行 Strauss 可能會有路徑問題，建議使用 WSL

### 故障排除

如果遇到問題，可以手動刪除 examples 目錄後重新執行：
```bash
rm -rf vendor/j7-dev/wp-utils/examples
composer strauss
```
