var cheerio = require('cheerio');
var request = require("request");

var fs = require('fs');
var http = require('http');

var cursor  = process.argv[2] || 900;
var MAX_IDX = process.argv[3] || 901;
var BASE_DIR = './';
var BASE_URL = 'http://jandan.net/ooxx/page-';
var urls = [];

letItGo(cursor);

function letItGo( cursor ) {
  var url = BASE_URL + cursor;
  console.log(url);

  request(  {
       url : url,
       headers : {
           "User-Agent" : "User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/534.30 (KHTML, like Gecko) Chrome/12.0.742.112 Safari/534.30"
       }
   }, function(error, response, body) {
        // console.log(body);
          if(!error && response.statusCode == 200) {
                  $ = cheerio.load( body );
                  $('div.text').each(function() {
                    $(this).find('img').each( function() {
                      var imgUrl = $(this).attr('src');
                      console.log('imgUrl-->>',imgUrl);
                      if ( $(this).attr('org_src') ) imgUrl = $(this).attr('org_src');
                      if ( imgUrl !== undefined && imgUrl !== null ) {
                        urls.push(imgUrl);
                      }
                    });
                  });
                  logger('Total urls:' + urls.length);
                  if ( MAX_IDX === cursor ) {
                    nextImage();
                  } else {
                    nextPage();
                  }
                  } else {
                    logger(url + ' error!');
                    nextPage();
                  }
              });
}

function download( url, fileName ) {
  var filePath = BASE_DIR + new Date().getTime() + fileName;
  var file = fs.createWriteStream( filePath );
  var request = http.get( url, function(response) {
    // console.log('---->>>',response)
    response.pipe( file );
    file.on('finish', function() {
      logger('Image Pool:' + urls.length + '; Download: ' + fileName);
      nextImage();
    });
  }).on('error', function( err ) {
    fs.unlink( filePath );
    logger('Image Pool:' + urls.length + ';Download Error: ' + fileName);
    nextImage()
  });
};

function nextPage() {
  cursor++;
  letItGo(cursor);
}

function nextImage() {
  if ( urls.length === 0 ) return;
  var url = urls.pop();
  var fileName = url.substring( url.lastIndexOf('/') + 1, url.length );
  // console.log('download-->>',url, fileName);
  download( url, fileName );
}

function logger ( msg ) {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(msg);
}
