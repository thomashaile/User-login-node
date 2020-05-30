const userLogin = async(req, res) => {
    try {

        const data = await fetch('/api/users/' + user.id, {
            method: 'GET',
            body: JSON.stringify(user),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        });
        console.log(data)
        res.json(data);
    } catch {
        return;
    }
};