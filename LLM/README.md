# LLM 文檔索引

本目錄包含 Strauss (PHP Namespace Renamer) 的詳細技術文檔，專為 LLM (大型語言模型) 設計，提供結構化的參考資料。

## 📚 文檔列表

### 1. [概覽](01-overview.md)
- Strauss 是什麼
- 核心概念和 Pipeline 架構
- 主要組件介紹
- 命令說明

**適用場景**: 第一次了解 Strauss 的運作原理

### 2. [配置選項詳解](02-configuration.md)
- 完整配置參數說明
- 基本配置 vs 進階配置
- 排除規則設定
- 向後兼容 Mozart 配置

**適用場景**: 需要設定 `composer.json` 的 `extra.strauss` 區塊

### 3. [使用範例](03-usage-examples.md)
- 基本使用流程
- WordPress 外掛開發範例
- 處理衝突的範例
- 進階使用技巧
- 命令列使用
- CI/CD 整合

**適用場景**: 需要實際的程式碼範例和配置模板

### 4. [常見問題與解決方案](04-troubleshooting.md)
- 15+ 個常見問題
- 每個問題的詳細解釋
- 具體的解決步驟
- 最佳實踐建議

**適用場景**: 遇到問題需要解決方案

### 5. [進階主題](05-advanced-topics.md)
- 內部架構深入解析
- PHP-Parser 的使用
- DiscoveredSymbols 資料結構
- 自動載入器生成
- 處理邊緣案例
- 效能優化
- 客製化 Strauss

**適用場景**: 深入理解 Strauss 內部運作或需要擴展功能

### 6. [快速參考](06-quick-reference.md)
- 安裝方式速查
- 配置模板
- 常用命令
- 選項速查表
- 除錯檢查清單
- 測試命令

**適用場景**: 快速查找配置或命令語法

### 7. [實際使用情境](07-real-world-scenarios.md)
- 10 個真實世界的使用案例
- WordPress 外掛開發
- 微服務架構
- CLI 工具打包
- 測試策略
- CI/CD 優化
- 外掛升級遷移

**適用場景**: 需要針對特定場景的完整解決方案

## 🎯 快速導航

### 我想...

**了解 Strauss 是什麼**
→ 閱讀 [01-overview.md](01-overview.md)

**設定我的專案**
→ 閱讀 [02-configuration.md](02-configuration.md) 和 [03-usage-examples.md](03-usage-examples.md)

**解決特定問題**
→ 閱讀 [04-troubleshooting.md](04-troubleshooting.md)

**快速查找配置語法**
→ 閱讀 [06-quick-reference.md](06-quick-reference.md)

**看實際範例**
→ 閱讀 [07-real-world-scenarios.md](07-real-world-scenarios.md)

**深入了解原理**
→ 閱讀 [05-advanced-topics.md](05-advanced-topics.md)

## 🔍 關鍵概念索引

### 核心功能
- **命名空間前綴**: [02-configuration.md#namespace_prefix](02-configuration.md)
- **類別前綴**: [02-configuration.md#classmap_prefix](02-configuration.md)
- **函數前綴**: [02-configuration.md#functions_prefix](02-configuration.md)
- **常數前綴**: [02-configuration.md#constant_prefix](02-configuration.md)

### Pipeline 處理
- **Pipeline 架構**: [01-overview.md#pipeline-架構](01-overview.md)
- **檔案掃描**: [01-overview.md#fileenumerator](01-overview.md)
- **符號掃描**: [01-overview.md#filesymbolscanner](01-overview.md)
- **前綴處理**: [01-overview.md#prefixer](01-overview.md)

### 常見任務
- **排除 PSR 介面**: [04-troubleshooting.md#問題-1-psr-介面應該前綴化嗎](04-troubleshooting.md)
- **減少打包體積**: [07-real-world-scenarios.md#情境-2-大型專案---減少體積](07-real-world-scenarios.md)
- **處理舊套件**: [07-real-world-scenarios.md#情境-3-遺留程式碼---處理沒有-autoload-的套件](07-real-world-scenarios.md)
- **更新呼叫位置**: [02-configuration.md#update_call_sites](02-configuration.md)

### 進階應用
- **自定義替換模式**: [02-configuration.md#namespace_replacement_patterns](02-configuration.md)
- **覆蓋 autoload**: [02-configuration.md#override_autoload](02-configuration.md)
- **PHP-Parser 使用**: [05-advanced-topics.md#php-parser-的使用](05-advanced-topics.md)
- **效能優化**: [05-advanced-topics.md#效能考量](05-advanced-topics.md)

## 📖 閱讀建議

### 新手路線
1. [01-overview.md](01-overview.md) - 了解基本概念
2. [03-usage-examples.md](03-usage-examples.md) - 看基本範例
3. [06-quick-reference.md](06-quick-reference.md) - 設定專案
4. [04-troubleshooting.md](04-troubleshooting.md) - 解決問題

### 進階使用者路線
1. [05-advanced-topics.md](05-advanced-topics.md) - 深入理解
2. [07-real-world-scenarios.md](07-real-world-scenarios.md) - 複雜場景
3. [02-configuration.md](02-configuration.md) - 完整配置

### 問題解決路線
1. [04-troubleshooting.md](04-troubleshooting.md) - 查找類似問題
2. [06-quick-reference.md](06-quick-reference.md) - 檢查配置語法
3. [03-usage-examples.md](03-usage-examples.md) - 參考範例

## 🔗 相關資源

- **主要文檔**: [../README.md](../README.md)
- **GitHub 專案**: https://github.com/BrianHenryIE/strauss
- **問題回報**: https://github.com/BrianHenryIE/strauss/issues
- **測試覆蓋**: https://brianhenryie.github.io/strauss/

## 📝 文檔維護說明

這些文檔是基於專案代碼和測試案例自動生成的。涵蓋的主要來源：

- `src/` - 核心實作
- `tests/Integration/` - 整合測試範例
- `tests/Issues/` - 已解決的問題案例
- `composer.json` 範例

**最後更新**: 2025-12-05

## ⚠️ 重要提醒

1. **README.md 優先**: 安裝說明請參考主要的 [README.md](../README.md)
2. **版本注意**: 文檔基於當前代碼版本，使用前請確認版本兼容性
3. **測試建議**: 建議先使用 `--dry-run` 測試配置
4. **備份提醒**: 修改前請備份專案，特別是啟用 `delete_vendor_packages` 時

## 🤝 貢獻

發現文檔錯誤或有改進建議？歡迎提交 Issue 或 Pull Request！
