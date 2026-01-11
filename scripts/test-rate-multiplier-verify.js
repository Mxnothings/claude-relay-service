#!/usr/bin/env node

/**
 * 费率倍数功能验证脚本
 *
 * 功能：
 * 1. 创建一个测试 API Key（设置倍率为 2.0）
 * 2. 模拟使用统计（1000 input tokens）
 * 3. 查看实际费用是否为原价的 2 倍
 */

const apiKeyService = require('../src/services/apiKeyService')
const logger = require('../src/utils/logger')
const redis = require('../src/models/redis')

async function verifyRateMultiplier() {
  try {
    console.log('🧪 开始验证费率倍数功能...\n')

    // 1. 创建测试 API Key（倍率 2.0）
    console.log('📝 步骤 1: 创建测试 API Key（倍率 2.0）')
    const testKey = await apiKeyService.generateApiKey({
      name: 'Rate Multiplier Test Key',
      description: '用于测试费率倍数功能',
      rateMultiplier: 2.0
    })
    console.log(`✅ API Key 创建成功: ${testKey.id}`)
    console.log(`   倍率设置: ${testKey.rateMultiplier}x\n`)

    // 2. 模拟使用统计
    console.log('📊 步骤 2: 模拟使用统计')
    const inputTokens = 1000
    const outputTokens = 500
    const model = 'claude-3-5-sonnet-20241022'

    console.log(`   Input Tokens: ${inputTokens}`)
    console.log(`   Output Tokens: ${outputTokens}`)
    console.log(`   Model: ${model}\n`)

    await apiKeyService.recordUsage(
      testKey.id,
      inputTokens,
      outputTokens,
      0, // cacheCreateTokens
      0, // cacheReadTokens
      model
    )

    // 3. 查看费用统计
    console.log('💰 步骤 3: 查看费用统计')

    // 获取使用记录
    const records = await redis.getUsageRecords(testKey.id, 1)
    if (records && records.length > 0) {
      const record = records[0]
      console.log(`✅ 使用记录已生成:`)
      console.log(`   实际费用: $${record.cost}`)
      console.log(`   使用倍率: ${record.rateMultiplier}x`)

      if (record.costBreakdown) {
        console.log(`   费用明细:`)
        console.log(`     - 原始总费用: $${record.costBreakdown.total}`)
        console.log(`     - 应用倍率后: $${record.costBreakdown.actual}`)
        console.log(`     - Input 费用: $${record.costBreakdown.input}`)
        console.log(`     - Output 费用: $${record.costBreakdown.output}`)
      }
    }

    // 获取累计费用
    const dailyCost = await redis.getDailyCost(testKey.id)
    console.log(`\n   累计费用: $${dailyCost}\n`)

    // 4. 验证结果
    console.log('🔍 步骤 4: 验证结果')
    if (records && records.length > 0) {
      const record = records[0]

      if (record.rateMultiplier === 2.0) {
        console.log('✅ 倍率记录正确: 2.0x')
      } else {
        console.log(`❌ 倍率记录错误: 预期 2.0，实际 ${record.rateMultiplier}`)
      }

      if (record.costBreakdown && record.costBreakdown.actual) {
        const expectedCost = record.costBreakdown.total * 2
        const actualCost = record.costBreakdown.actual
        const diff = Math.abs(expectedCost - actualCost)

        if (diff < 0.000001) {
          console.log('✅ 费用计算正确: 实际费用 = 原价 × 2.0')
          console.log(`   原价: $${record.costBreakdown.total}`)
          console.log(`   实际: $${actualCost} = $${record.costBreakdown.total} × 2.0`)
        } else {
          console.log('❌ 费用计算错误:')
          console.log(`   预期: $${expectedCost}`)
          console.log(`   实际: $${actualCost}`)
        }
      }
    }

    // 5. 清理测试数据
    console.log('\n🧹 步骤 5: 清理测试数据')
    await apiKeyService.deleteApiKey(testKey.id)
    console.log('✅ 测试 API Key 已删除')

    console.log('\n✨ 验证完成！')
    process.exit(0)

  } catch (error) {
    console.error('❌ 验证失败:', error)
    logger.error('Rate multiplier verification failed:', error)
    process.exit(1)
  }
}

// 运行验证
verifyRateMultiplier()
