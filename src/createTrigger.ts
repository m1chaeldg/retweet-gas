import Weekday = GoogleAppsScript.Base.Weekday;

export class Trigger {
  initialize() {
    const triggers = ScriptApp.getProjectTriggers();
    let triggerExists = false;
    for (let i = 0; i < triggers.length; i++) {
      if (triggers[i].getHandlerFunction() == 'updateLZAccountTrigger') {
        triggerExists = true;
        break;
      }
    }

    if (!triggerExists) {
      ScriptApp.newTrigger('updateLZAccountTrigger').timeBased().everyDays(1).atHour(0).create();
    }
  }

  createTrigger() {
    const noOfDays = 1;

    const today = new Date();
    // create trigger to get the daily slp
    //  const startDate = new Date('2021-11-14T00:00:00.000Z');
    const startDate = new Date('2021-11-14T00:00:00.000Z');
    // startDate.setHours(19, 0, 0, 0);
    startDate.setMonth(today.getMonth());
    startDate.setDate(today.getDate());
    startDate.setFullYear(today.getFullYear());

    this.createTriggerFunc(noOfDays, startDate, 'start');
  }

  createTriggerFunc(noOfDays: number, triggerDay: Date, triggerFunc: string) {
    for (let i = 0; i < noOfDays; i++) {
      ScriptApp.newTrigger(triggerFunc).timeBased().at(triggerDay).create();
      triggerDay.setDate(triggerDay.getDate() + 1);
    }
  }

  // Delete all the existing triggers for the project
  deleteTriggers() {
    const triggers = ScriptApp.getProjectTriggers();
    for (let i = 0; i < triggers.length; i++) {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  // Creates a Google Sheets on change trigger for the specific sheet
  createSpreadsheetEditTrigger(sheetID) {
    const triggers = ScriptApp.getProjectTriggers();
    let triggerExists = false;
    for (let i = 0; i < triggers.length; i++) {
      if (triggers[i].getTriggerSourceId() == sheetID) {
        triggerExists = true;
        break;
      }
    }

    if (!triggerExists) {
      const spreadsheet = SpreadsheetApp.openById(sheetID);
      ScriptApp.newTrigger('importSheet').forSpreadsheet(spreadsheet).onChange().create();
    }
  }
}
