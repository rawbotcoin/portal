$.ajax({
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    method: 'GET',
    url: 'https://gist.githubusercontent.com/toolazytobetrue/d93d11769fbb03a9a72a08aaa1a562f4/raw/ee11ec149d48a18c43a3a68b6498542595c4a0f1/gistfile1.txt',
    success: function (data, textStatus, jqXHR) {
        $('#snippet_field').html(data);
    },
    error: function (jqXHR, textStatus, errorThrown) {
        console.log(errorThrown)
    }
});