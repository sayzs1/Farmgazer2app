import { DynamicTool } from "@langchain/core/tools";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import sql from 'mssql';

// Azure SQL查询函数
export const queryAzureSQL = async (sqlQuery: string): Promise<any[]> => {
  let pool;
  try {
    // 配置连接
    const config = {
      server: process.env.AZURE_SQL_SERVER || '',
      user: process.env.AZURE_SQL_USER || '',
      password: process.env.AZURE_SQL_PASSWORD || '',
      database: process.env.AZURE_SQL_DATABASE || '',
      options: {
        encrypt: true,
        trustServerCertificate: false,
      },
    };

    // 创建连接池
    pool = await sql.connect(config);
    
    // 执行查询
    const result = await pool.request().query(sqlQuery);
    
    // 返回结果
    return result.recordset;
  } catch (error: any) {
    console.error('SQL查询错误详情:', error);
    throw new Error(`Azure SQL查询错误: ${error.message}`);
  } finally {
    // 关闭连接
    if (pool) await pool.close();
  }
};

// 创建数据库查询工具
export const createDatabaseQueryTool = () => {
  return new DynamicTool({
    name: "query_farm_database",
    description: `用于查询农场监测系统的数据库。可以查询问题类别统计、温度湿度数据、作物健康状况等信息。
    数据库包含以下信息：
    表名: dbo.ImageData
    列:
    - image_id (字符串): 图像唯一标识符
    - device_id (字符串): 设备ID
    - time (日期时间): 拍摄时间
    - temperature (数字): 温度
    - humidity (数字): 湿度
    - category_tag (字符串): 问题分类标签，包括 ["weeds", "drought", "disease", "ponding", "healthy", "pest"]
    - AI_analysis (字符串): AI分析结果的文本描述
    - priority (整数): 问题优先级 (1-5)
    
    用户提出的查询将被转换为SQL并在数据库上执行。实时时间采用数据库的时间
    `,
    func: async (userQuery: string) => {
      try {
        // 1. 使用LLM将自然语言转换为SQL
        const sqlGenerationLLM = new ChatOpenAI({
          model: "gpt-3.5-turbo",
          temperature: 0,
        });
        
        const sqlPrompt = `
        请将以下自然语言查询转换为SQL查询语句。
        查询应该针对这个表: dbo.ImageData
        表结构:
        - image_id (字符串): 图像唯一标识符
        - device_id (字符串): 设备ID
        - time (日期时间): 拍摄时间
        - temperature (数字): 温度
        - humidity (数字): 湿度
        - category_tag (字符串): 问题分类标签，包括 ["weeds", "drought", "disease", "ponding", "healthy", "pest"]
        - AI_analysis (字符串): AI分析结果的文本描述
        - priority (整数): 问题优先级 (1-5)

        请只返回SQL查询语句，确保语法与Azure SQL数据库兼容。不要包含其他说明。
        
        用户查询: ${userQuery}
        `;
        
        const sqlResponse = await sqlGenerationLLM.invoke([
          new HumanMessage(sqlPrompt),
        ]);
        
        const sqlQuery = sqlResponse.content.toString().trim();
        
        // 2. 执行SQL查询
        const result = await queryAzureSQL(sqlQuery);
        
        // 3. 格式化查询结果
        const formattedResults = JSON.stringify(result, null, 2);
        
        return `根据您的查询，我在数据库中找到了以下信息：
        
SQL查询：
\`\`\`sql
${sqlQuery}
\`\`\`

查询结果：
\`\`\`json
${formattedResults}
\`\`\`
        `;
      } catch (error: any) {
        console.error('数据库工具错误详情:', error);
        return `查询数据库时出错: ${error.message}。请检查数据库连接配置或SQL查询语法。`;
      }
    },
  });
}; 