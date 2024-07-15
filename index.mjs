import readline from 'readline';
import fs from 'fs';
let myTable = {
    columnsSetting : [
        { key: 'id', title: 'Id', width: 5, datatype: "text"},
        { key: 'name', title: 'Name', width: 15, datatype: "text"},
        { key: 'birthday', title: 'Birthday', width: 15, datatype: "date" },
        { key: 'info', title: 'Information', width: 30, datatype: "text"},
        ],
    rows : [
        {id : 1, name: "Alice", birthday: "12-09", info: ""},
        {id : 2, name: "Mary", birthday: "07-07", info: "She likes books, traveling, and hanging out with friends."},
        {id : 3, name: "Alexandera Winterhaus", birthday: "20-07", info: "She likes books, traveling, and hanging out with friends."},
        {id : 4, name: "Christoph J. Smith", birthday: "30-11", info: "Party animal"},
    ],
    urgentDate : 0,
    title : "Happy Birthday",
    sortByKey : "id",
    }
const NO_FIND = -1;
const COLOR_RESET = '\x1b[0m';
const COLOR_RED = '\x1b[31m';
const COLOR_GREEN = '\x1b[32m';
const COLOR_BLUE = '\x1b[34m';
const UNDERSCORE = '\x1b[4m';
const BRIGHT = '\x1b[1m';
const RED_COLOR = 1;
const GREEN_COLOR = 2;
const NO_COLOR = 0;
const ORIGINAL_ROW_GAP = " | ";
const ROW_GAP = `${COLOR_BLUE} | ${COLOR_RESET}`;
const ROW_BEGIN = `${COLOR_BLUE}| ${COLOR_RESET}`;
function tableTerminalDistance(){
    const terminalWidth = process.stdout.columns;
    const tableWidth = myTable.columnsSetting.reduce((accu,row)=>accu + row.width, 0) + (myTable.columnsSetting.length - 1) * ORIGINAL_ROW_GAP.length + 2 * 2;
    return " ".repeat(Math.round((terminalWidth - tableWidth) / 2));
}
function printTitleRow(){
    const terminalWidth = process.stdout.columns;
    let spaceCount = Math.round((terminalWidth - myTable.title.length) / 2);
    spaceCount = spaceCount < 0 ? 0: spaceCount;
    const outputRow = " ".repeat(spaceCount) + `${COLOR_BLUE}${BRIGHT}${UNDERSCORE}${myTable.title}${COLOR_RESET}`;
    console.log("");
    console.log(outputRow);
    console.log("");
}
function printHeaderRow(){
    let outputRow = tableTerminalDistance() + ROW_BEGIN;
    for(let i = 0; i < myTable.columnsSetting.length; i ++){
        outputRow += `${COLOR_BLUE}${myTable.columnsSetting[i].title.padEnd(myTable.columnsSetting[i].width)}${COLOR_RESET}` + ROW_GAP;
    }
    console.log(outputRow);
    printDividerRow();
}
function printDividerRow(){
    let outputRow = tableTerminalDistance() + ROW_BEGIN;
    for(let i = 0; i < myTable.columnsSetting.length; i ++){
        outputRow += "".padEnd(myTable.columnsSetting[i].width,"-") + ROW_GAP;
    }
    console.log(`${COLOR_BLUE}${outputRow}${COLOR_RESET}`);
}
function wrapString(str,num){
    let string = str.toString();
    let arr = [];
    let index = 0;
    const arrStrLength = num;
    while(string.length > arrStrLength){
        arr[index] = string.slice(0,arrStrLength);
        const spaceIndex = arr[index].lastIndexOf(" ");
        if(spaceIndex !== -1){
            arr[index] = string.slice(0,spaceIndex).padEnd(arrStrLength);
            string = string.slice(spaceIndex + 1);  
        }
        else string = string.slice(arrStrLength);
        index ++;
    }
    arr[index] = string.padEnd(arrStrLength);
    return arr;
}
function printRow(row, color){
    const copyRow = {};
    Object.assign(copyRow, row);
    const rowCounts = [];
    for(let key in copyRow){
        const propWidth = myTable.columnsSetting.find(a => a.key === key).width;
        copyRow[key] = wrapString(copyRow[key], propWidth);
        rowCounts.push(copyRow[key].length);
    }
    const maxRowCounts = Math.max(...rowCounts);
    for(let i = 0; i < maxRowCounts; i ++){
        let outputRow = tableTerminalDistance() + ROW_BEGIN;
        for(let item of myTable.columnsSetting){
            const prop = item.key;
            if(prop in copyRow){
                if(color === 1){
                    outputRow += `${COLOR_RED}${(copyRow[prop][i] ?? " ".padEnd(item.width))}${COLOR_RESET}` + ROW_GAP;
                }else if(color === 2){
                    outputRow += `${COLOR_GREEN}${(copyRow[prop][i] ?? " ".padEnd(item.width))}${COLOR_RESET}` + ROW_GAP;
                }else
                    outputRow += (copyRow[prop][i] ?? " ".padEnd(item.width)) + ROW_GAP;
            }else{
                outputRow += " ".padEnd(item.width) + ROW_GAP;
            }
        }
        console.log(outputRow);
    }
    printDividerRow();
}

function printRows(){
    console.log("");
    if(myTable.title !== "") printTitleRow();
    printHeaderRow();
    sortRows();
    for(let i = 0; i < myTable.urgentDate; i ++) 
        printRow(myTable.rows[i], GREEN_COLOR);
    for(let i = myTable.urgentDate; i < myTable.rows.length; i++)
        printRow(myTable.rows[i], NO_COLOR);
    console.log("");
}
function sortRows(){
    const sortKey = myTable.sortByKey;
    const column = myTable.columnsSetting.find(a => a.key === sortKey);
    if(column === undefined || column.datatype === undefined) 
        return;
    if(column.datatype === "date") sortRowsByDate(column.key);
    else if (column.datatype === "text") sortRowsByDefault(column.key);
}
function sortRowsByDefault(key){
    const emptyRows = myTable.rows.filter(a => a[key] === "" || a[key] === undefined);
    const notEmptyRows = myTable.rows.filter(a=>a[key] !== "" && a[key] !== undefined);
    myTable.rows = notEmptyRows.sort((a,b)=>a[key].toString().toLowerCase().localeCompare(b[key].toString().toLowerCase()));
    myTable.rows = notEmptyRows.concat(emptyRows);
    let id = 1;
    for(let row of myTable.rows){
        row.id = id;
        id ++;
    }
}
function sortRowsByDate(key){
    const today = new Date();
    const thisMonth = today.getUTCMonth() + 1;
    const thisDay = today.getUTCDate();
    const thisYear = today.getUTCFullYear();
    const emptyRows = myTable.rows.filter(a => a[key] === "" || a[key] === undefined);
    const notEmptyRows = myTable.rows.filter(a=>a[key] !== "" && a[key] !== undefined);
    notEmptyRows.sort((a,b)=>{
        if(!a[key] || !b[key]) return 0;
        const [aDay,aMonth] = a[key].split("-").map(Number);            
        const [bDay,bMonth] = b[key].split("-").map(Number);
        const aDate = new Date(thisYear, aMonth - 1, aDay);
        const bDate = new Date(thisYear, bMonth - 1, bDay);
        if(aDate < today) aDate.setFullYear(thisYear + 1);
        if(bDate < today) bDate.setFullYear(thisYear + 1);
        return aDate - bDate;
    });
    myTable.rows = notEmptyRows.concat(emptyRows);
    let id = 1;
    for(let row of myTable.rows){
        row.id = id;
        id ++;
    }
    myTable.urgentDate = notEmptyRows.filter(a =>{
        const twoWeeks = 2* 7 * 24 * 60 * 60 * 1000;
        const [aDay,aMonth] = a[key].split("-").map(Number); 
        const aDate = new Date(thisYear, aMonth - 1, aDay);
        if(aDate < today) aDate.setFullYear(thisYear + 1);
        if((aDate - today) < twoWeeks) return true;
    }).length;
}
function saveTable(){
    const saveData = JSON.stringify(myTable);
    fs.writeFileSync("./myTable.json", saveData, 'utf8');
}
function restoreTable(){
    if (fs.existsSync("./myTable.json")) {
        const restoreData = fs.readFileSync("./myTable.json", 'utf8');
        myTable = JSON.parse(restoreData);
    }else {
        saveTable();
    }
}
function commandList(){
    rl.question("Please enter command: ", (answer) => {
        if (answer.trim().toLowerCase() === 'exit') {
            rl.close();
        } else if (answer.trim().toLowerCase() === 'add') {
            addReadline();
        } else if (answer.trim().toLowerCase() === 'remove') {
            removeReadline();
        } else if (answer.trim().toLowerCase() === 'show') {
            showReadline();
        } else if (answer.trim().toLowerCase() === 'find') {
            findReadline();
        } else if (answer.trim().toLowerCase() === 'sort') {
            sortReadline();
        } else if (answer.trim().toLowerCase() === 'edit') {
            editReadline();
        } else if (answer.trim().toLowerCase() === 'config add column') {
            configAddCol();
        } else if (answer.trim().toLowerCase() === 'config edit column') {
            configEditCol();
        } else if (answer.trim().toLowerCase() === 'config remove column') {
            configRemoveCol();
        } else if (answer.trim().toLowerCase() === 'show table setting') {
            showTableSetting();
        } else if (answer.trim().toLowerCase() === 'config table title') {
            configTableTitle();
        } else if (answer.trim().toLowerCase() === 'help') {
            console.log(menuInfo);
            commandList();
        } else {
            console.log(`Unrecognized command`);
            commandList();
        }
    });
}
function isValidDate(inputStr){
    if(/^\d{2}-\d{2}(-\d{4})?$/.test(inputStr) === false)
        return false;
    const [day,month,] = inputStr.split("-");
    if (month < 1 || month > 12)
        return false;
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return day > 0 && day <= daysInMonth[month - 1];
}
function showMain(saveColumn, saveRow){
    saveTable();
    printRows();
    commandList();
}
function questionEachEntry(keyArr, entryIndex, row){    
    if(entryIndex === keyArr.length){
        row.id = myTable.rows.length + 1;
        myTable.rows.push(row);
        showMain();
    }
    rl.question(`Enter ${keyArr[entryIndex]} : `,(input)=> {
        const inputStr = input.trim().split(/\s+/).join(" ");
        const columnType = myTable.columnsSetting.find(a => a.key === keyArr[entryIndex]).datatype;
        if(columnType === "date"){
            if(inputStr !== "" && !isValidDate(inputStr)){
                console.log("You must enter a valid date with format dd-mm-yyyy(year is optional).");
                questionEachEntry(keyArr,entryIndex, row);
            }else{
                row[keyArr[entryIndex]] = inputStr;
                entryIndex ++;
                questionEachEntry(keyArr, entryIndex, row);
            }
        }else{
            row[keyArr[entryIndex]] = inputStr;
            entryIndex ++;
            questionEachEntry(keyArr, entryIndex, row);
        }
    });
}
function editEachEntry(keyArr, entryIndex, row){    
    if(entryIndex === keyArr.length){
        showMain();
    }
    rl.question(`Enter ${keyArr[entryIndex]} : `,(input)=> {
        const inputStr = input.trim().split(/\s+/).join(" ");
        const columnType = myTable.columnsSetting.find(a => a.key === keyArr[entryIndex]).datatype;
        if(columnType === "date"){
            if(inputStr !== ""){
                if(!isValidDate(inputStr)){
                    console.log("You must enter a valid date with format dd-mm-yyyy(year is optional).");
                    editEachEntry(keyArr, entryIndex, row);
                }
                row[keyArr[entryIndex]] = inputStr;
            }
            entryIndex ++;
            editEachEntry(keyArr, entryIndex, row);
        }else{
            if(inputStr !== "") row[keyArr[entryIndex]] = inputStr;
            entryIndex ++;
            editEachEntry(keyArr, entryIndex, row);
        }
    });
}
function addReadline(){
    const keyArr = myTable.columnsSetting.map(a=> a.key);
    let newRow = {};
    const entryIndex = 1;
    questionEachEntry(keyArr, entryIndex, newRow);
}
function removeReadline(){
    rl.question("Enter id : ",(input)=>{
        const removeRowIndex = myTable.rows.findIndex((a) => a.id == Number(input));
        if(removeRowIndex === NO_FIND){
            console.log("This row doesn't exist in table.");
            commandList();
        }else{
            const removeRow = myTable.rows[removeRowIndex];
            printHeaderRow();
            printRow(removeRow, RED_COLOR);
            rl.question(`Do you really want to remove this row?\n${COLOR_RED}All content will be lost. y/n ${COLOR_RESET}: `,(answer)=>{
                if(answer.trim().toLowerCase() === 'y'){
                    myTable.rows.splice(removeRowIndex, 1);
                    showMain();
                }else if(answer.trim().toLowerCase() === 'n'){
                    commandList();
                }else{
                    console.log("Invalid");
                    commandList();
                };
            })
        }
    });
}
function editReadline(){
    rl.question("Enter id : ",(input)=>{
        const editRowIndex = myTable.rows.findIndex(a=>a.id === Number(input));
        if(editRowIndex === NO_FIND){
            console.log("This row doesn't exist in table.");
            commandList();
        }else{
            const editRow = myTable.rows[editRowIndex];
            printHeaderRow();
            printRow(editRow, RED_COLOR);
            const entryIndex = 1;
            const keyArr = myTable.columnsSetting.map(a=> a.key);
            editEachEntry(keyArr, entryIndex ,editRow);
        }
    });
}
function showReadline(){
    printRows();
    commandList(); 
}
function findReadline(){
    rl.question("Enter key words : ",(input)=>{
        if(input === "") commandList();
        const inputArr = input.split(/\s+/).map(a=>a.toLowerCase());
        const resultRows = [];
        for(let row of myTable.rows){
            const valuesStr = Object.values(row).join("").toLowerCase();
            for(let word of inputArr){
                if(valuesStr.search(word) !== NO_FIND) resultRows.push(row);        
            }
        }
        printHeaderRow();
        for(let row of resultRows){            
            printRow(row, NO_COLOR);
        }
        commandList();     
    });
}
function sortReadline(){
    rl.question("Enter title : ", (input)=>{
        const inputStr = input.trim().toLowerCase();
        const column = myTable.columnsSetting.find(a => a.title.toLowerCase() === inputStr);
        if(column === undefined){
            console.log("This column doesn't exist in table.");
            commandList();
        }else{
            if(column.datatype === "date"){
                sortRowsByDate(inputStr);
            }else{
                sortRowsByDefault(inputStr);
                myTable.urgentDate = 0;
            } 
            myTable.sortByKey = column.key;
            showMain();
        }
    });
}
function configAddCol(){
    rl.question("Enter column title : ", (input)=>{
        const newKey = input.trim().toLowerCase();
        if(myTable.columnsSetting.find(a=>a.key === newKey) !== undefined){
            console.log("This column exists in table.");
            commandList(); 
        }
        const newCol = {};
        newCol.key = newKey;
        newCol.title = input.trim();
        rl.question("Enter width of this column : ", (input)=>{
            const colWidth = Number(input.trim());
            if(colWidth !== NaN && Number.isInteger(colWidth) && colWidth > 0){
                newCol.width = colWidth;
                rl.question("Enter datatype of this column ( date or text): ", (input)=>{
                    const colType = input.trim().toLowerCase();
                    if(colType === "date") newCol.datatype = "date";
                    else if (colType === "text") newCol.datatype = "text";
                    else newCol.datatype = "text";
                    rl.question("Enter the position of this column( a number biger as 0) : ", (input)=>{
                        const colPosition = Number(input.trim());
                        if(Number.isInteger(colPosition)){
                            if(colPosition === 0){
                            console.log("Position 0 is reserved for Id.");
                            commandList();
                            }else if(colPosition > 0 && colPosition < myTable.columnsSetting.length){
                                myTable.columnsSetting.splice(colPosition - 1, 0, newCol);
                                showMain();
                            }
                            else{
                                myTable.columnsSetting.push(newCol);
                                showMain();
                            }
                        }else{
                            console.log("Invalid");
                            commandList();
                        }
                    });
                });
            }else{
                console.log("Invalid");
                commandList();
            }
        });
    });
}
function configRemoveCol(){
    rl.question("Enter column title : ", (input)=>{
        const removeTitle = input.trim().toLowerCase();
        const colIndex = myTable.columnsSetting.findIndex(a=>a.title.toLowerCase() === removeTitle);
        if(colIndex === NO_FIND){
            console.log("This column doens't exist in table.");
            commandList(); 
        }else if(myTable.columnsSetting[colIndex].key === "id"){
            console.log("This column is not allowed to be removed.");
            commandList(); 
        }
        rl.question(`Do you really want to remove ${COLOR_RED}${removeTitle}${COLOR_RESET} column?\n${COLOR_RED}All content will be lost. y/n ${COLOR_RESET}: `,(answer)=>{
            if (answer.trim().toLowerCase() === 'y') {
                const removeKey = myTable.columnsSetting[colIndex].key;
                if(myTable.sortByKey === removeKey){
                    myTable.sortByKey = "id";
                }
                if(myTable.columnsSetting[colIndex].datatype === "date"){
                    myTable.urgentDate = 0;
                }
                myTable.columnsSetting.splice(colIndex,1);
                for(let row of myTable.rows){
                    if(removeKey in row)  delete row[removeKey];
                }
                showMain();
            } else if (answer.trim().toLowerCase() === 'n') {
                commandList();
            } else {
                console.log("Invalid");
                commandList();
            }
        })
    });
}
function editColumnEntry(entry, column){
    if(entry === "title"){
        rl.question(`Enter new title to replace ${COLOR_RED}${column.title}${COLOR_RESET} : `, (input)=>{
            const colTitle = input.trim();
            if(colTitle === ""){
                editColumnEntry("width", column);
            }else{
                column.title = colTitle;
                editColumnEntry("width", column);
            }
        });
    }else if(entry === "width"){
        rl.question(`Enter new width to replace ${COLOR_RED}${column.width}${COLOR_RESET} : `,(input)=>{
            if(input === ""){
                editColumnEntry("datatype", column);
            }else if(Number(input.trim()) !== NaN && Number.isInteger(Number(input.trim())) && Number(input.trim()) > 0){
                column.width = Number(input.trim());
                editColumnEntry("datatype", column);
            }else{
                console.log("Invalid");
                editColumnEntry("width", column);
            }
        })
    }else if(entry === "datatype"){
        rl.question(`Enter new datatype(date or text) to replace ${COLOR_RED}${column.datatype}${COLOR_RESET} : `,(input)=>{
            const colType = input.trim();
            if(colType === ""){
                showMain();
            }else if(colType === column.datatype){
                console.log("Entered datatype is same as existing one.");
                showMain();
            }else if(colType === "text"){
                column.datatype = colType;
                showMain();
            }else if(colType === "date"){
                const result = convertColumnTypeDate(column.key);
                if(result){
                    column.datatype = colType;
                    showMain();
                }else{
                    console.log("Content doesn't fit in date format. Change column datatype failed. ");
                    commandList(); 
                }
            }else{
                console.log("Only support date or text datatype.");
                commandList(); 
            }
        })
    }
}
function convertColumnTypeDate(key){
    const contentArr = myTable.rows.filter(row => row[key] !== "" &&  row[key] !== undefined).map(row => row[key]);
    const checkArr = contentArr.filter(row => isValidDate(row));
    return contentArr.length === checkArr.length;
}
function configEditCol(){
    rl.question("Enter column title : ", (input)=>{
        const title = input.trim().toLowerCase();
        const column = myTable.columnsSetting.find(a=>a.title.toLowerCase() === title);
        if(column === undefined){
            console.log("This column doens't exist in table.");
            commandList(); 
        }else{
            editColumnEntry("title", column);
        }
    });
}
function configTableTitle(){
    rl.question("Enter table title : ", (input)=>{
        const tableTitle = input.trim();
        myTable.title = tableTitle;
        showMain();
    });
}
function showTableSetting(){
    console.table(myTable.columnsSetting);
    console.log(`sort by : ${myTable.sortByKey}`);
    console.log(`table title : ${myTable.title}`);
    commandList(); 
}
restoreTable();
printRows();
const menuInfo = `
Rows in ${COLOR_GREEN}green${COLOR_RESET} means the dates come in two weeks.
You can enter command to manage the table.
${COLOR_BLUE}${UNDERSCORE}${BRIGHT}add${COLOR_RESET} :    add a new row to table. 
${COLOR_BLUE}${UNDERSCORE}${BRIGHT}remove${COLOR_RESET} : remove an existing row from table.
${COLOR_BLUE}${UNDERSCORE}${BRIGHT}edit${COLOR_RESET} :   modify an existing row in table.
${COLOR_BLUE}${UNDERSCORE}${BRIGHT}find${COLOR_RESET} :   input some key words to find some rows.
${COLOR_BLUE}${UNDERSCORE}${BRIGHT}sort${COLOR_RESET} :   sort table.
${COLOR_BLUE}${UNDERSCORE}${BRIGHT}show${COLOR_RESET} :   show the table.
${COLOR_BLUE}${UNDERSCORE}${BRIGHT}help${COLOR_RESET} :   show the commands.
${COLOR_BLUE}${UNDERSCORE}${BRIGHT}exit${COLOR_RESET} :   quit.
You can also enter command to modify the configration of table.
${COLOR_BLUE}${UNDERSCORE}${BRIGHT}config add column${COLOR_RESET} :      add a column to table.
${COLOR_BLUE}${UNDERSCORE}${BRIGHT}config remove column${COLOR_RESET} :   remove a column from table.
${COLOR_BLUE}${UNDERSCORE}${BRIGHT}config edit column${COLOR_RESET} :    modify a column.
${COLOR_BLUE}${UNDERSCORE}${BRIGHT}show table setting${COLOR_RESET} :    show setting of this table
${COLOR_BLUE}${UNDERSCORE}${BRIGHT}config table title${COLOR_RESET} :    modify table title.\n`;
console.log(menuInfo);
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
commandList();
