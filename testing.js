const call = async () => {
    const data = new FormData();
    data.append("title", "shreyank");
    data.append("numQuestions", 5);
    data.append("difficultyLevel", "easy");
    data.append("file", "file");

    const response = await fetch("http://localhost:8000/questions/generate-questions/", {
    method: "POST",
    headers: {
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJleHAiOjE3NDA2NzIwNTV9.k5Ksg7-Eef8HSe-Y-q7-KQ8aZOMWkyfin0oH2j2e_m0`
    },
    body: data,
    });

    const responseData = await response.json();

    console.log(responseData);
}

call()