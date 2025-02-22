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

// 导出 getConnection 函数
export async function getConnection() {
  await poolConnect;
  return pool;
}

// 导出 query 函数
export async function query<T>(queryString: string, params: any[] = []) {
  try {
    const connection = await getConnection();
    const request = connection.request();
    
    // 添加参数
    params.forEach((param, index) => {
      request.input(`param${index}`, param);
    });
    
    const result = await request.query(queryString);
    return result.recordset as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// 在应用关闭时关闭连接池
process.on('SIGINT', () => {
  pool.close();
});