const groupArray = (arr, propertyToGroupBy) => {
    let result = {};
    if (arr.length > 0 && typeof(arr[0])==="object" && Object.keys(arr[0]).length > 1){
        for (const ele of arr){
            if (result[ele[propertyToGroupBy]]){
                result[ele[propertyToGroupBy]].push(ele);
            } else {
                result[ele[propertyToGroupBy]] = [ele]
            }
        }
        return result;
    } else {
        return arr;
    }
}

module.exports = {
    groupArray
}