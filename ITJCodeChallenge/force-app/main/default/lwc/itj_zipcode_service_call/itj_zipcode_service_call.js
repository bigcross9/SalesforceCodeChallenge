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

    usData;
    countryNameValue;
    zipcodeValue;
    countryNamesObj;
    countryAbbv;
    connectedCallback(){
        console.log('all check');
        fetch(COUNTRY_NAMES)
            .then((response) => response.json())
            .then((data) => {
                this.countryNamesObj = data;
            }).catch(error => {
                console.log('Error when reading static resource ' + error);
            });
        
    }

   
    //Makes the call to zippopotam api to retrieve the details of the zipcode
    getZipDetails(countryCode, zipCode) {
        let usData = [];
        const calloutURI = 'https://api.zippopotam.us/'+ countryCode +'/' + zipCode;
        console.log('calloutURI ' + calloutURI);
         fetch(calloutURI, {
             method: "GET"
         }).then((response) => {
            console.log('response status ' +  response.status);
            // if the response from the call is not 200 shows a gentle message to the user
            if(response.status !== 200){
                const evt = new ShowToastEvent({
                    title: 'Error',
                    message:'Oops! an error ocurred, check with your System Administrator for more information',
                    variant: 'error',
                });
                this.dispatchEvent(evt);
            }
             //returns the body of the response
            return response.json();
        })
        .then(data => {
            console.log(JSON.stringify(data))
            if(data !== undefined && data !== 'undefined' && data !== null  && Object.keys(data).length !== 0 && data !== ''){
                data['places'] = JSON.stringify(data['places']);
                console.log('places:  ' + data.places);
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

    //passing the object and value it going to find the key related to its value. i.e. United States is the value and the key is US
     getKeyByValue(object, value) {

        return Object.keys(object).find(key => object[key].toLowerCase() === value.toLowerCase());
     }

    //stores the value from the inputs
     handleChange(event){
        if (event.target.dataset.id === "countryNameText") {
            this.countryNameValue = event.target.value;
            console.log(event.target.value);
        }else if(event.target.dataset.id === "zipcodeText"){
            this.zipcodeValue = event.target.value;
        }
     }

    //make the search and invoke the api call
     handleClick(){
        let countryCode;

        countryCode = this.getKeyByValue(this.countryNamesObj, this.countryNameValue);

        console.log("country code2 " + countryCode);
        if(countryCode !== undefined && countryCode !== "undefined" && countryCode !== null){
            console.log("country code found!")
            this.getZipDetails(countryCode, this.zipcodeValue);
        }
     }

    //when the user search for zip code from another country than US it should create a record with the response in a custom object
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
                        filterName: 'All'
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
