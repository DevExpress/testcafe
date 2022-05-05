const fs   = require('fs');
const path = require('path');

class FileStorage {
    constructor (fileName, dirName) {
        this.fileName = fileName;
        this.fullPath = path.resolve(dirName, fileName);
        this.data     = [];
    }

    load () {
        this.data = this.getData();
    }

    add (val) {
        this.data.push(val);
    }

    setData (val) {
        this.data = val;
    }

    getData () {
        try {
            const dataStr = fs.readFileSync(this.fullPath).toString();

            return JSON.parse(dataStr);
        }
        catch (err) {
            return [];
        }
    }

    clear () {
        this.data = [];
    }

    delete () {
        if (fs.existsSync(this.fullPath))
            fs.unlinkSync(this.fullPath);
    }

    save () {
        fs.writeFileSync(this.fullPath, JSON.stringify(this.data));
    }

    safeAdd (val) {
        this.load();
        this.add(val);
        this.save();
    }
}

module.exports = FileStorage;
