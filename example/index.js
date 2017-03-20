const a = () => {
    for (let i = 0; i < 1000000; i++) {
        true;
    }
    return true;
}

const b = () => true;

const c = () => true;

setInterval(() => {
    a();
    b();
}, 100);


setInterval(function(){
    c();
}, 1000);