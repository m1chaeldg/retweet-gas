export class LZAccounts {
  getCopyLzTwitterAccountsToLocalSheet() {
    const ss = SpreadsheetApp.openById('1EkLdjOQruGzJLiQm5s9J55goRkrUKZdBV78VXrl5CPo');
    const sheet = ss.getSheetByName('Sheet1');
    //A2:A200
    return sheet.getRange('A2:200').getValues();
  }
}
