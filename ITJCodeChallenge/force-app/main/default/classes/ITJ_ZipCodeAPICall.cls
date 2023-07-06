public with sharing class ITJ_ZipCodeAPICall {
    
    public class ZipCodeDetails{
        @InvocableVariable
        public String country;
        @InvocableVariable
        public String postalCode;
        @InvocableVariable
        public String countryAbbv;
        @InvocableVariable
        public String jsonResponse;
        @InvocableVariable
        public String places;
    }

    public class InputData{
        @invocableVariable
        public String countryCode;
        @invocableVariable
        public String postalCode;
    }

    @InvocableMethod(label = 'Invoke zippopotam' description = 'api call')
    public static List<ZipCodeDetails> getPostalCodeDetails(List<InputData> inputDataList){
        ZipCodeDetails zipDetails = new ZipCodeDetails();
        List<ZipCodeDetails> zipCodeList = new List<ZipCodeDetails>();
        Http h = new Http();

        HttpRequest req = new HttpRequest();
        String url = 'https://api.zippopotam.us/' + inputDataList[0].countryCode + '/' + inputDataList[0].postalCode;
        System.debug('url:::: ' + url);
        req.setEndpoint(url);
        req.setMethod('GET');

        HttpResponse res = h.send(req);

        JSONParser parser = JSON.createParser(res.getBody());
        zipDetails.jsonResponse = res.getBody();
        while(parser.nextToken() != null){
            if (parser.getCurrentToken() == JSONToken.FIELD_NAME) {
                String text = parser.getText();
                if (parser.nextToken() != JSONToken.VALUE_NULL) {
                    if(text == 'post code'){
                        zipDetails.postalCode = parser.getText();
                    }
                    else if(text == 'country'){
                        zipDetails.country = parser.getText();
                    }
                    else if(text == 'country abbreviation'){
                        zipDetails.countryAbbv = parser.getText();
                    }
                    else if(text == 'places'){
                        zipDetails.places = '[';
                        if(parser.getCurrentToken() == JSONToken.START_ARRAY) {
                            while(parser.getCurrentToken() != JSONToken.END_ARRAY) {
                                parser.nextToken();
                                if(parser.getText() != 'null' && parser.getCurrentToken() != JSONToken.END_OBJECT){
                                    zipDetails.places += parser.getText() + ' ';
                                }else {
                                    zipDetails.places += parser.getText();
                                }
                            }
                        }
                    }
                }
            }
        }
        System.debug('zipDetails ' + zipDetails);
        zipCodeList.add(zipDetails);
        return zipCodeList;
    }
}