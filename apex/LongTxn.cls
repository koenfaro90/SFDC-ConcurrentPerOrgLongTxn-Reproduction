@RestResource(urlMapping='/LongTxn')
global with sharing class LongTxn {
    /* Rest resources */
    @HttpPost
    global static void handlePost() {
        System.debug(LoggingLevel.ERROR, 'HandlePost called');
        RestResponse res = RestContext.response;
        res.addHeader('Content-Type', 'application/json');
        res.responseBody = Blob.valueOf('{}');
    }
    @HttpGet
    global static void handleGet() {
        System.debug(LoggingLevel.ERROR, 'HandleGet called');
        RestResponse res = RestContext.response;
        res.addHeader('Content-Type', 'application/json');
        res.responseBody = Blob.valueOf('{}');
    }
    /* Remote action */
    @RemoteAction
    public static String remoteGet() {
        System.debug(LoggingLevel.ERROR, 'RemoteGet called');
        return 'RemoteGet response';
    }
}
