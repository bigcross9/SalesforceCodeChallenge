@IsTest
public class ITJ_ZipCodeAPICall_Test {
    
    @isTest
    public static void test_serviceCall(){
        ITJ_ZipCodeAPICall.InputData inputData = new ITJ_ZipCodeAPICall.InputData();
        List<ITJ_ZipCodeAPICall.InputData> inputDataList = new List<ITJ_ZipCodeAPICall.InputData>();
        inputData.countryCode = 'MX';
        inputData.postalCode = '01000';
        inputDataList.add(inputData);
        String zippopotamResponse = '{"post code":"01000","country":"Mexico","country abbreviation":"MX","places":[{"place name":"San Angel","longitude":"-99.225","state":"Distrito Federal","state abbreviation":"DIF","latitude":"19.3733"},{"place name":"Villa Obregon","longitude":"-99.225","state":"Distrito Federal","state abbreviation":"DIF","latitude":"19.3733"}]}';
        
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator(zippopotamResponse));
        
        ITJ_ZipCodeAPICall.getPostalCodeDetails(inputDataList);

    }
}