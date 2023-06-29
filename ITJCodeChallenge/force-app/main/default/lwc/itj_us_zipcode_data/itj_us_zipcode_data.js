import { LightningElement,api ,track  } from 'lwc';

const columns = [
    { label: 'Postal Code', fieldName: 'post code', type: 'text'},
    { label: 'Country', fieldName: 'country', type: 'text'},
    { label: 'Country Abbreviation', fieldName: 'country abbreviation', type: 'text'}
];

export default class Itj_us_zipcode_data extends LightningElement {

    @api usDataResponse;
    columns = columns;

}