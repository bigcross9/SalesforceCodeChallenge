trigger RiskChangeEvent on RiskEvent__e (after insert) {

    List<Case> cases = new List<Case>();
    Id userId = [Select id from User where username = 'hadriel84@hotmail.com'].id;
    for (RiskEvent__e event : Trigger.New) {
        if (event.Risk__c == 'High') {
            System.debug('High risk detected');
            Case cs = new Case();
            cs.Priority = 'High';
            cs.Subject = 'High risk detected';
            cs.OwnerId = userId;
            cases.add(cs);
        }
    }
    
    if (cases.size() > 0) {
        System.debug('new case to be created');
        insert cases;
    }
}