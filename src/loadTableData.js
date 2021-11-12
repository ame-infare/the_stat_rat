const { PythonShell } = require('python-shell');

function loadData(message) { 
    let options = {
        mode: 'json',
        pythonPath: 'python',
        pythonOptions: ['-u'],
        scriptPath: './db_queries/',
        args: [JSON.stringify(message)]
    };

    return new Promise(resolve => {
        PythonShell.run('controller.py', options, function (err, results) {
            if (err) throw err;
            resolve(results[0]);
        });
    });
}
