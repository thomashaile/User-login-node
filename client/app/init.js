const init = async() => {
    debugger;
    //file path
    const res = await fetch('/api/users');
    const data = await res.json();
    console.log(data);

};