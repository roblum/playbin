console.log($.fn.jquery); // Log version of jquery

var opopjQuery = document.createElement('script');
opopjQuery.src = 'https://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js';
document.querySelector('head').appendChild(opopjQuery);


var opopInit = function(){
     jQuery.noConflict();
     (function($){
          console.log($.fn.jquery);
     })(jQuery);

     oldjQuery();
}

function oldjQuery(){
     console.log($.fn.jquery);
}

opopjQuery.onload = opopInit