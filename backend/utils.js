

export const bubbleSort_JSON = (json) =>{
  let arr = Object.keys(json); // Using the keys of the JSON to work as array 

  // This algorithm sort the keys of the json with their values
  let len = arr.length; 
  for (let i = len-1; i>=0; i--){
    for(let j = 1; j<=i; j++){
      if(json[arr[j-1]] < json[arr[j]]){ //DESCENDING
          let temp = arr[j-1];
          arr[j-1] = arr[j];
          arr[j] = temp;
       }
    }
  }

  let newJson = {};
  arr.forEach((a) => newJson[a] = json[a]); // Passing the sorting keys with their values.
  return newJson;
}