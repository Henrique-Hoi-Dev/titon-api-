export const updateHours = (numOfHours, date = new Date()) => {
    const dateCopy = new Date(date.getTime());

    dateCopy.setHours(dateCopy.getHours() + numOfHours);

    return dateCopy;
};
