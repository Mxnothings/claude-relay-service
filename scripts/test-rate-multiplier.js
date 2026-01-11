#!/usr/bin/env node

/**
 * 简化测试 - 费率倍数计算逻辑
 */

console.log('🧪 测试费率倍数计算逻辑\n')

// 模拟价格数据 (USD per 1M tokens)
const pricing = {
  input: 3.0,
  output: 15.0,
  cacheWrite: 3.75,
  cacheRead: 0.3
}

// 测试数据
const usage = {
  inputTokens: 1000,
  outputTokens: 500,
  cacheCreateTokens: 200,
  cacheReadTokens: 100
}

console.log('📊 使用量数据:')
console.log(`  Input: ${usage.inputTokens} tokens`)
console.log(`  Output: ${usage.outputTokens} tokens`)
console.log(`  Cache Create: ${usage.cacheCreateTokens} tokens`)
console.log(`  Cache Read: ${usage.cacheReadTokens} tokens`)
console.log()

console.log('💵 价格 (per 1M tokens):')
console.log(`  Input: $${pricing.input}`)
console.log(`  Output: $${pricing.output}`)
console.log(`  Cache Write: $${pricing.cacheWrite}`)
console.log(`  Cache Read: $${pricing.cacheRead}`)
console.log()

// 计算原始费用
const inputCost = (usage.inputTokens / 1000000) * pricing.input
const outputCost = (usage.outputTokens / 1000000) * pricing.output
const cacheWriteCost = (usage.cacheCreateTokens / 1000000) * pricing.cacheWrite
const cacheReadCost = (usage.cacheReadTokens / 1000000) * pricing.cacheRead
const totalCost = inputCost + outputCost + cacheWriteCost + cacheReadCost

console.log('💰 原始费用计算:')
console.log(`  Input:       $${inputCost.toFixed(6)}`)
console.log(`  Output:      $${outputCost.toFixed(6)}`)
console.log(`  Cache Write: $${cacheWriteCost.toFixed(6)}`)
console.log(`  Cache Read:  $${cacheReadCost.toFixed(6)}`)
console.log(`  ─────────────────────────────`)
console.log(`  Total:       $${totalCost.toFixed(6)}`)
console.log()

// 测试不同倍率
const multipliers = [1.0, 1.5, 0.8, 2.0, 0.5]

console.log('🔢 费率倍数测试:')
console.log('='.repeat(70))

multipliers.forEach(multiplier => {
  const actualCost = totalCost * multiplier
  const savings = totalCost - actualCost
  const savingsPercent = ((1 - multiplier) * 100).toFixed(1)

  console.log()
  console.log(`倍率 ${multiplier}x:`)
  console.log(`  原始费用: $${totalCost.toFixed(6)}`)
  console.log(`  实际费用: $${actualCost.toFixed(6)}`)

  if (multiplier > 1) {
    console.log(`  加价:     $${Math.abs(savings).toFixed(6)} (+${Math.abs(savingsPercent)}%)`)
  } else if (multiplier < 1) {
    console.log(`  优惠:     $${Math.abs(savings).toFixed(6)} (-${Math.abs(savingsPercent)}%)`)
  } else {
    console.log(`  无调整`)
  }
})

console.log()
console.log('='.repeat(70))
console.log('✨ 测试完成!')
console.log()
console.log('📝 使用说明:')
console.log('  1. 在 .env 文件中设置: DEFAULT_RATE_MULTIPLIER=1.5')
console.log('  2. 重启服务: npm start')
console.log('  3. 所有 API Key 将按 1.5 倍计费（除非单独设置）')
console.log()
console.log('  API Key 级别设置（通过 Redis）:')
console.log('  - 在 Web 界面创建/编辑 API Key 时设置 rateMultiplier 字段')
console.log('  - API Key 级别的倍率优先于全局倍率')
