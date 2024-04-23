var sliderValue = sessionStorage.getItem("sliderResponse");

if (sliderValue >=70){
    window.location.href=`/${id}/EducationalComponent/${type}/endOfMeetingResponse1`
}

else{
    window.location.href=`/${id}/EducationalComponent/${type}/endOfMeetingResponse2`
}
