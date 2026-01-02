/**
 * 配置警告页面 - 当 Supabase 未配置时显示
 */

export default function ConfigWarningPage() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 px-4">
      <div className="w-full max-w-2xl">
        {/* 警告图标 */}
        <div className="text-center mb-8">
          <div className="inline-block p-6 bg-white rounded-3xl shadow-lg mb-4">
            <span className="text-7xl">⚠️</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            需要配置 Supabase
          </h1>
          <p className="text-gray-600">
            应用需要连接到 Supabase 数据库才能正常使用
          </p>
        </div>

        {/* 配置步骤 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <span className="inline-block w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center mr-3 text-sm">
              1
            </span>
            打开 SETUP.md 文件
          </h2>
          <p className="text-gray-600 ml-11 mb-4">
            在项目根目录找到 <code className="bg-gray-100 px-2 py-1 rounded">SETUP.md</code> 文件，按照详细步骤操作。
          </p>

          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <span className="inline-block w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center mr-3 text-sm">
              2
            </span>
            注册 Supabase
          </h2>
          <p className="text-gray-600 ml-11 mb-4">
            访问 <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
              supabase.com
            </a> 注册账号并创建项目（免费）
          </p>

          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <span className="inline-block w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center mr-3 text-sm">
              3
            </span>
            创建 .env 文件
          </h2>
          <div className="ml-11 mb-4">
            <p className="text-gray-600 mb-2">
              在项目根目录创建 <code className="bg-gray-100 px-2 py-1 rounded">.env</code> 文件，填入以下内容：
            </p>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`VITE_SUPABASE_URL=你的_Project_URL
VITE_SUPABASE_ANON_KEY=你的_anon_public_key`}
            </pre>
          </div>

          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <span className="inline-block w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center mr-3 text-sm">
              4
            </span>
            创建数据库表
          </h2>
          <p className="text-gray-600 ml-11 mb-4">
            在 Supabase SQL 编辑器中执行 SETUP.md 中的 SQL 代码。
          </p>

          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <span className="inline-block w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center mr-3 text-sm">
              5
            </span>
            刷新页面
          </h2>
          <p className="text-gray-600 ml-11">
            配置完成后，刷新此页面即可开始使用。
          </p>
        </div>

        {/* 快速提示 */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start">
            <span className="text-2xl mr-3">💡</span>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">预计时间</h3>
              <p className="text-sm text-blue-800">
                首次配置大约需要 10-15 分钟。配置一次后，所有设备都可以使用。
              </p>
            </div>
          </div>
        </div>

        {/* 帮助链接 */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            遇到问题？查看 
            <span className="mx-1 text-primary-600 font-medium">README.md</span>
            或 
            <span className="ml-1 text-primary-600 font-medium">SETUP.md</span>
          </p>
        </div>
      </div>
    </div>
  );
}

