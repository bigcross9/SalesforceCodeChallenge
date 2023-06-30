@isTest
global class MockHttpResponseGenerator implements HttpCalloutMock {
    private String body;
    public MockHttpResponseGenerator(String body){
        this.body = body;
    }
    // Implement this interface method
    global HTTPResponse respond(HTTPRequest req) {
        // Optionally, only send a mock response for a specific endpoint
        // and method.
       
        
        // Create a fake response
        HttpResponse res = new HttpResponse();
        res.setHeader('Content-Type', 'application/json');
        res.setBody(this.body);
        res.setStatusCode(200);
        return res;
    }
}