function main() {
  // set google sheet url
  var SheetUrl  = 'https://docs.google.com/spreadsheets/d/141CCPzfh3PZcML-R-goX8r4r8N3B88Th-AsK9oYVkQA/edit?ts=5e61f6d9#gid=0';
  var recipient = 'moi_estrello@hotmail.com';
  var dateRange = 'YESTERDAY';
  var apiUrl    = 'https://www.softwarehomework.com/api.php';
  var response  = JSON.parse(UrlFetchApp.fetch(apiUrl, {'muteHttpExceptions': true}));
  var proApiUrl = 'https://www.softwarehomework.com/product_api.php';
  var proRes    = JSON.parse(UrlFetchApp.fetch(proApiUrl, {'muteHttpExceptions': true}));
  
  var map_names = {
    'GP - Aleman'	          : 'Digital Download DE',
    'GP - Portugués'        : 'Digital Download PT',
    'Actual - Reino Unido'	: 'Digital Download UK',
    'GP - English'	        : 'Digital Download EN',
    'GP - Europe'	          : 'Digital Download EU',
    'GP - Árabe'	          : 'Digital Download AR',
    'GP - Español'	        : 'Digital Download ES',
    'Ck - Mexico'	          : 'Digital Download MX',
    'Actual - Francés'	    : 'Digital Download FR',
    'GP - India'	          : 'Digital Download IN',
    'GP - Asia'	            : 'Digital Download A',
    'GP - Español No Mx'	  : 'Digital Download ES',
    'GP - English World'	  : 'Digital Download EN'
    
  };
  
  function getQtyAndMxn(date){
    if(response[date]!=undefined){
      return response[date];
    }
    else{
      return {'mxn' : 0, 'qty' : 0};
    }
  }
  
  function getProductQtyAndMxn(date,camp){
    if(proRes[date+'_'+camp]!=undefined){
      return proRes[date+'_'+camp];
    }
    /*else{
      return {'product' : map_names[camp], 'mxn' : 0, 'qty' : 0};
    }*/
  }
 

  // Please do not edit below this line
  var dateNow      = new Date();
  var sheetName     = Utilities.formatDate(dateNow, AdsApp.currentAccount().getTimeZone(), "yyyyMMdd");

  var GetSheet      = SpreadsheetApp.openByUrl(SheetUrl);
  var DataSheet     = GetSheet.getActiveSheet();
  var GetDataRange = DataSheet.getDataRange();
  var GetDataValue = GetDataRange.getValues();
  // Total Sheet
  var TotalSheet    = GetSheet.getSheetByName("Ads Totals");
  if(TotalSheet == null){
    GetSheet.insertSheet("Ads Totals");
    var TotalSheet = GetSheet.getSheetByName("Ads Totals");
  }
  var GetTotalRange = TotalSheet.getDataRange();
  var GetTotalValue = GetTotalRange.getValues();
  // Conv Report Combined
  var ConvSheet = GetSheet.getSheetByName("Conv. Report Combined Totals");
  if(ConvSheet == null){
    GetSheet.insertSheet("Conv. Report Combined Totals");
    var ConvSheet = GetSheet.getSheetByName("Conv. Report Combined Totals");
  }
  var GetConvRange = ConvSheet.getDataRange();
  var GetConvValue = GetConvRange.getValues();
  // Conv Report Combined By Campaign
  var CampConvSheet = GetSheet.getSheetByName("Conv. Report Combined by Campaign");
  if(CampConvSheet == null){
    GetSheet.insertSheet("Conv. Report Combined by Campaign");
    var CampConvSheet = GetSheet.getSheetByName("Conv. Report Combined by Campaign");
  }
  var GetCampConvRange = CampConvSheet.getDataRange();
  var GetCampConvValue = GetCampConvRange.getValues();
  
  //DataSheet.clear();
  var activeRange = GetSheet.getActiveRange();

  if(GetDataValue[0][0] != 'Date'){
    DataSheet.setColumnWidth(2, 200);
    DataSheet.appendRow(['Date','Campaign Name','Cost','Conversions','Impressions','Clicks','BiddingStrategyType',"Target ROAS"]);
    DataSheet.getRange(DataSheet.getActiveRange().getRow(),1,1,DataSheet.getLastColumn()).setFontWeight("bold").setFontColor("#333").setBackgroundColor('#CCC');
  }
  if(GetTotalValue[0][0] != 'Date'){
    TotalSheet.appendRow(['Date','Cost','Conversions','Impressions','Clicks']);
    TotalSheet.getRange(TotalSheet.getActiveRange().getRow(),1,1,TotalSheet.getLastColumn()).setFontWeight("bold").setFontColor("#333").setBackgroundColor('#CCC');
  }
  if(GetConvValue[0][0] != 'Date'){
    ConvSheet.appendRow(['Date','Cost','Conversions','Impressions','Clicks','Mxn','Qty']);
    ConvSheet.getRange(ConvSheet.getActiveRange().getRow(),1,1,ConvSheet.getLastColumn()).setFontWeight("bold").setFontColor("#333").setBackgroundColor('#CCC');
  }
  if(GetCampConvValue[0][0] != 'Date'){
    CampConvSheet.appendRow(['Date','CampaignName','Cost','Conversions','Impressions','Clicks','BiddingStrategy','Target ROAS','Product Name','Mxn','Qty']);
    CampConvSheet.getRange(CampConvSheet.getActiveRange().getRow(),1,1,CampConvSheet.getLastColumn()).setFontWeight("bold").setFontColor("#333").setBackgroundColor('#CCC');
  }

  var campaignReport = AdsApp.report("SELECT CampaignName,Date,Cost,Conversions,Impressions,Clicks,BiddingStrategyType,MaximizeConversionValueTargetRoas FROM CAMPAIGN_PERFORMANCE_REPORT DURING "+dateRange).rows();
  var totalRows   = [];
  var date        = '--';
  while(campaignReport.hasNext()){
    var reports = campaignReport.next();
    date = (reports['Date'].replace(/-/g,''));
    if(proRes[date+'_'+reports['CampaignName']]!=undefined){
      DataSheet.appendRow(
        [
          (reports['Date'].replace(/-/g,'')),
          reports['CampaignName'],
          parseFloat(reports['Cost'].replace(/,/g, '')),
          parseFloat(reports['Conversions'].replace(/,/g, '')),
          reports['Impressions'],
          reports['Clicks'],
          reports['BiddingStrategyType'],
          reports['MaximizeConversionValueTargetRoas']
        ]
      );
    }
    
    var getProduct = getProductQtyAndMxn(reports['Date'].replace(/-/g,''),reports['CampaignName']);
    if(getProduct){
      CampConvSheet.appendRow(
        [
          (reports['Date'].replace(/-/g,'')),
          reports['CampaignName'],
          parseFloat(reports['Cost'].replace(/,/g, '')),
          parseFloat(reports['Conversions'].replace(/,/g, '')),
          reports['Impressions'],
          reports['Clicks'],
          reports['BiddingStrategyType'],
          reports['MaximizeConversionValueTargetRoas'],
          getProduct.product,
          getProduct.mxn,
          getProduct.qty,
        ]
      );
    }

    if(totalRows[date] == undefined){
      totalRows[date] = {
        date:date,
        cost:parseFloat(reports['Cost'].replace(/,/g, '')),
        clicks:parseInt(reports['Clicks']),
        impressions:parseInt(reports['Impressions']),
        conversions:parseFloat(reports['Conversions'].replace(/,/g, ''))
      };
    }
    else{
      totalRows[date].cost += parseFloat(reports['Cost'].replace(/,/g, ''));
      totalRows[date].clicks += parseInt(reports['Clicks']);
      totalRows[date].impressions += parseInt(reports['Impressions']);
      totalRows[date].conversions += parseFloat(reports['Conversions'].replace(/,/g, ''));
    }
  }
  var newArray = totalRows.filter(function(){return true;});

  for (var i=0;i<newArray.length;i++){
    ConvSheet.appendRow(
      [
        newArray[i].date,
        newArray[i].cost,
        newArray[i].conversions,
        newArray[i].impressions,
        newArray[i].clicks,
        getQtyAndMxn(newArray[i].date)['mxn'],
        getQtyAndMxn(newArray[i].date)['qty']
      ]
    );
    
    TotalSheet.appendRow(
      [
        newArray[i].date,
        newArray[i].cost,
        newArray[i].conversions,
        newArray[i].impressions,
        newArray[i].clicks
      ]
    );
  }

  var html = '<p>Your campaign report for '+sheetName+' is ready<br /><a href="'+SheetUrl+'#gid='+DataSheet.getSheetId()+'">Click Here to Download</a></p>';

  if(recipient!=''){
    var emailQuotaRemaining = MailApp.getRemainingDailyQuota();
    if(emailQuotaRemaining > 0){
      //MailApp.sendEmail({to:recipient,subject: 'Campaign Report '+sheetName,htmlBody: html});
    }
    else{
      Logger.log("Email quota exceeded for "+AdWordsApp.currentAccount().getName());
    }
  }
}
