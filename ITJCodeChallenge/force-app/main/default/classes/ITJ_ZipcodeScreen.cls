/**
 * apex-defined class to show the results with Flows
 */
public class ITJ_ZipcodeScreen {
    @AuraEnabled
    public String country;
    @AuraEnabled
    public String postalCode;
    @AuraEnabled
    public String countryAbbv;
    @AuraEnabled
    public String jsonResponse;
    @AuraEnabled
    public String places;
}