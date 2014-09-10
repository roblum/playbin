var firebase = new Firebase("https://blistering-fire-6807.firebaseIO.com");

firebase.child('NYU').child('counter').on('value', updateLeaderboard);

// firebase.on('value', function(ss){
//      console.log(ss.val());
// });

firebase.on('child_changed', function(ss){
     console.log('child changed:');
     console.log(ss.val());
     console.log(ss.ref().name());
});

function updateLeaderboard(ss) {
   $('#nyu').text(ss.val()||0);
}

function ranGenerator (){
     var schools = ['NYU', 'Columbia', 'Hunter'];

     var randomSchool = schools[Math.floor(Math.random()*schools.length)];
     console.log(randomSchool);
     incId(randomSchool);
}

ranGenerator();

// creates a new, incremental record
function incId(school) {
    // increment the counter
    firebase.child(school).child('counter').transaction(function(currentValue) {
        return (currentValue||0) + 1
    }, function(err, committed, ss) {
        if( err ) {
           setError(err);
        }
        else if( committed ) {
           // if counter update succeeds, then create record
           // probably want a recourse for failures too
           // addRecord(ss.val());
        }
    });
}
