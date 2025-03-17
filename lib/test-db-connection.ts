import sql from 'mssql';

async function testConnection() {
  let pool;
  try {
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

    console.log('尝试连接到数据库...');
    pool = await sql.connect(config);
    console.log('连接成功!');
    
    // 列出所有表
    console.log('查询数据库中的所有表...');
    const tables = await pool.request().query(`
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_TYPE = 'BASE TABLE'
    `);
    console.log('数据库中的表:', tables.recordset);
    
    // 如果找到了表，尝试查询其结构
    if (tables.recordset.length > 0) {
      const firstTable = tables.recordset[0].TABLE_NAME;
      console.log(`查询表 ${firstTable} 的结构...`);
      const columns = await pool.request().query(`
        SELECT COLUMN_NAME, DATA_TYPE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = '${firstTable}'
      `);
      console.log(`表 ${firstTable} 的列:`, columns.recordset);
    }
    
    // 在现有代码中添加特定表查询
    console.log('查询 dbo.ImageData 表的结构...');
    const imageDataColumns = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'ImageData'
    `);
    console.log('dbo.ImageData 表的列:', imageDataColumns.recordset);
    
    // 可选：尝试查询表中的数据样本
    console.log('查询 dbo.ImageData 表的数据样本...');
    const sampleData = await pool.request().query(`
      SELECT TOP 3 * FROM dbo.ImageData
    `);
    console.log('数据样本:', sampleData.recordset);
    
    return true;
  } catch (error) {
    console.error('连接测试失败:', error);
    return false;
  } finally {
    if (pool) await pool.close();
  }
}

testConnection(); 