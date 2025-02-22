import sql from 'mssql';

const sqlConfig = {
  user: process.env.AZURE_SQL_USER,
  password: process.env.AZURE_SQL_PASSWORD,
  database: process.env.AZURE_SQL_DATABASE,
  server: process.env.AZURE_SQL_SERVER || '',
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 300000 // 设置空闲超时为5分钟
  },
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

// 创建一个全局的连接池
const pool = new sql.ConnectionPool(sqlConfig);
const poolConnect = pool.connect();

// 在应用关闭时关闭连接池
process.on('SIGINT', () => {
  pool.close();
});

export async function query<T>(queryText: string, params: any[] = []): Promise<T> {
  await poolConnect; // 确保池已连接

  try {
    const request = pool.request();
    
    // 添加参数
    params.forEach((param, index) => {
      request.input(`param${index}`, param);
    });

    const result = await request.query(queryText);
    return result.recordset;
  } catch (err) {
    console.error('Database query error:', err);
    throw err;
  }
}