import { LightningElement,api ,track  } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import COUNTRY_NAMES from '@salesforce/resourceUrl/Itj_country_names';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { createRecord } from 'lightning/uiRecordApi';
import ITJ_ZIPCODE from '@salesforce/schema/ITJ_Zipcode__c';
import POSTAL_CODE_FIELD from '@salesforce/schema/ITJ_Zipcode__c.Postal_Code__c';
import COUNTRY_FIELD from '@salesforce/schema/ITJ_Zipcode__c.ITJ_Country__c';
import COUNTRY_ABBV_FIELD from '@salesforce/schema/ITJ_Zipcode__c.ITJ_Country_Abbreviation__c';
import JSON_REPONSE_FIELDS from '@salesforce/schema/ITJ_Zipcode__c.ITJ_Non_US_Response__c';

export default class Itj_zipcode_service_call extends NavigationMixin(LightningElement) {

    @track usData;
    @track countryNameValue;
    @track zipcodeValue;
    @track countryNamesObj;
    countryAbbv;
    connectedCallback(){
        console.log('lowercase check');
        fetch(COUNTRY_NAMES)
            .then((response) => response.json())
            .then((data) => {
                this.countryNamesObj = data;
            });
        
    }

   
    
    getZipDetails(countryCode, zipCode) {
        let usData = [];
        const calloutURI = 'https://api.zippopotam.us/'+ countryCode +'/' + zipCode;
        console.log('calloutURI ' + calloutURI);
         fetch(calloutURI, {
             method: "GET"
         }).then((response) => {
            console.log('response status ' +  response.status);
            if(response.status !== 200){
                const evt = new ShowToastEvent({
                    title: 'Error',
                    message:'Oops! an error ocurred, check with your System Administrator for more information',
                    variant: 'error',
                });
                this.dispatchEvent(evt);
            }
            return response.json();
        })
        .then(data => {
            console.log(JSON.stringify(data))
            if(data !== undefined && data !== 'undefined' && data !== null  && Object.keys(data).length !== 0 && data !== ''){
                if(data['country abbreviation'] === 'US'){
                    usData.push(data);
                    this.usData = usData;
                    console.log(JSON.stringify(usData));
                }else{
                    let postalCodeParam = data['post code'];
                    let countryParam = data['country'];
                    let countryAbbvParam = data['country abbreviation'];
                    let jsonResponseParam = JSON.stringify(data);
                    this.saveNonUSRecords(postalCodeParam, countryParam, countryAbbvParam, jsonResponseParam);
                }
            }
        })
        .catch(error => {
            console.log('error log ' + error);
        });
     }

     getKeyByValue(object, value) {

        return Object.keys(object).find(key => object[key].toLowerCase() === value.toLowerCase());
     }

     handleChange(event){
        if (event.target.dataset.id === "countryNameText") {
            this.countryNameValue = event.target.value;
            console.log(event.target.value);
        }else if(event.target.dataset.id === "zipcodeText"){
            this.zipcodeValue = event.target.value;
        }
     }

     handleClick(){
        let countryCode;

        countryCode = this.getKeyByValue(this.countryNamesObj, this.countryNameValue);

        console.log("country code2" + countryCode);
        this.getZipDetails(countryCode, this.zipcodeValue);
     }

     saveNonUSRecords(postalCode, country, countryAbbv, jsonResponse){
        const fields = {};
        fields[POSTAL_CODE_FIELD.fieldApiName] = postalCode;
        fields[COUNTRY_FIELD.fieldApiName] = country;
        fields[COUNTRY_ABBV_FIELD.fieldApiName] = countryAbbv;
        fields[JSON_REPONSE_FIELDS.fieldApiName] = jsonResponse;

        const recordInput = { apiName: ITJ_ZIPCODE.objectApiName, fields };
        createRecord(recordInput)
            .then(zipObj => {
                console.log(zipObj.Id);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Account created',
                        variant: 'success',
                    }),
                );

                this[NavigationMixin.Navigate]({
                    type: 'standard__objectPage',
                    attributes: {
                        objectApiName: 'ITJ_Zipcode__c',
                        actionName: 'list'
                    },
                    state: {       
                        filterName: '00BDm000004bZ50MAE'
                    },
                });
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error creating record',
                        message: error.body.message,
                        variant: 'error',
                    }),
                );
            });
     }
}