var firebase = new Firebase("https://blistering-fire-6807.firebaseIO.com");

ranGenerator();

firebase.on('value', function(ss){
     console.log('these are all the values');
     console.log(ss.val());
     var allData = ss.val();

     for (data in allData){
          var current = data
          ,currentCounter = allData[data].counter;

          console.log('for loop current');
          console.log(currentCounter);

          $('#' + data + ' span').text(currentCounter);
     }
});

firebase.on('child_changed', function(ss){
     console.log('child changed:');
     console.log(ss.val());
     console.log(ss.ref().name());
     var school = ss.ref().name();

     updateLeaderboard(ss, school);
});

     function ranGenerator (){ // This function simulates the choice of a user
          var schools = ['Baruch', 'Columbia', 'Cooper-Union', 'Hunter', 'NYU'];

          var randomSchool = schools[Math.floor(Math.random()*schools.length)];
          console.log(randomSchool);

          incId(randomSchool);
     }


          function updateLeaderboard(ss, school) {
               console.log('ss val')
               console.log(ss.val());
               console.log(school);

               $('#' + school + ' span').text(ss.val().counter||0);
          }


// creates a new, incremental record
function incId(school) {
    // increment the counter
    firebase.child(school).child('counter').transaction(function(currentValue) {
        return (currentValue||0) + 1
    }, function(err, committed, ss) {
        if( err ) {
           // setError(err);
        }
        else if( committed ) {
           // if counter update succeeds, then create record
           // probably want a recourse for failures too
           // addRecord(ss.val());
        }
    });
}
