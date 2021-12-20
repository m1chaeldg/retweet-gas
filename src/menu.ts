export class Menu {
  createCustomMenu() {
    const menuEntries = [
      { name: 'Update LZ Accounts', functionName: 'updateLZAccountTrigger' },
      { name: 'Initialize', functionName: 'initialize' },
      { name: 'Run Retweet and Like', functionName: 'start' },
    ];
    const sh = SpreadsheetApp.getActiveSpreadsheet();
    sh.addMenu('App Script', menuEntries);
  }
}
