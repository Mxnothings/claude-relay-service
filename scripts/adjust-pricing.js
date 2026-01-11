#!/usr/bin/env node

/**
 * 批量调整模型价格脚本
 * 使用方法：node scripts/adjust-pricing.js <倍数>
 * 例如：node scripts/adjust-pricing.js 1.5  // 所有价格乘以 1.5
 */

const fs = require('fs')
const path = require('path')

const multiplier = parseFloat(process.argv[2])

if (!multiplier || multiplier <= 0) {
  console.error('❌ 请提供有效的倍数参数')
  console.log('\n使用方法：node scripts/adjust-pricing.js <倍数>')
  console.log('例如：')
  console.log('  node scripts/adjust-pricing.js 1.5   # 所有价格 × 1.5')
  console.log('  node scripts/adjust-pricing.js 2.0   # 所有价格 × 2')
  console.log('  node scripts/adjust-pricing.js 0.8   # 所有价格 × 0.8（打8折）')
  process.exit(1)
}

const pricingFile = path.join(process.cwd(), 'data', 'model_pricing.json')
const backupFile = path.join(process.cwd(), 'data', `model_pricing.backup.${Date.now()}.json`)

if (!fs.existsSync(pricingFile)) {
  console.error(`❌ 价格文件不存在: ${pricingFile}`)
  console.log('请先运行服务以下载价格数据')
  process.exit(1)
}

try {
  // 读取原始数据
  const originalData = JSON.parse(fs.readFileSync(pricingFile, 'utf8'))

  // 备份原始文件
  fs.writeFileSync(backupFile, JSON.stringify(originalData, null, 2))
  console.log(`✅ 已备份原始价格到: ${backupFile}`)

  // 调整价格
  const adjustedData = originalData.map(model => {
    const adjusted = { ...model }

    if (adjusted.input_cost_per_token) {
      adjusted.input_cost_per_token *= multiplier
    }
    if (adjusted.output_cost_per_token) {
      adjusted.output_cost_per_token *= multiplier
    }
    if (adjusted.cache_creation_input_token_cost) {
      adjusted.cache_creation_input_token_cost *= multiplier
    }
    if (adjusted.cache_read_input_token_cost) {
      adjusted.cache_read_input_token_cost *= multiplier
    }

    return adjusted
  })

  // 写入调整后的数据
  fs.writeFileSync(pricingFile, JSON.stringify(adjustedData, null, 2))

  console.log(`\n✅ 价格调整完成！所有价格已乘以 ${multiplier}`)
  console.log('\n📊 示例模型价格变化：')

  // 显示几个常用模型的价格变化
  const exampleModels = [
    'claude-sonnet-4-5-20250929',
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022'
  ]

  exampleModels.forEach(modelName => {
    const original = originalData.find(m => m.model_name === modelName)
    const adjusted = adjustedData.find(m => m.model_name === modelName)

    if (original && adjusted) {
      console.log(`\n  ${modelName}:`)
      console.log(`    Input:  $${(original.input_cost_per_token * 1000000).toFixed(2)}/MTok → $${(adjusted.input_cost_per_token * 1000000).toFixed(2)}/MTok`)
      console.log(`    Output: $${(original.output_cost_per_token * 1000000).toFixed(2)}/MTok → $${(adjusted.output_cost_per_token * 1000000).toFixed(2)}/MTok`)
    }
  })

  console.log('\n⚠️  请重启服务以应用新价格：')
  console.log('   pm2 restart claude-relay-service')
  console.log('\n💡 如需恢复原价格：')
  console.log(`   cp ${backupFile} ${pricingFile}`)

} catch (error) {
  console.error('❌ 错误:', error.message)
  process.exit(1)
}
