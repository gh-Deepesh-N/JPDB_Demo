$(document).ready(function() {
    const jpdbBaseURL = "http://api.login2explore.com:5577";
    const jpdbIRL = "/api/irl";
    const jpdbIML = "/api/iml";
    const connToken = "90931980|-31949224693469031|90962504"; 
    const dbName = "SCHOOL-DB";
    const relName = "STUDENT-TABLE";

    const rollNoInput = $("#rollNo");
    const fullNameInput = $("#fullName");
    const classInput = $("#class");
    const birthDateInput = $("#birthDate");
    const addressInput = $("#address");
    const enrollmentDateInput = $("#enrollmentDate");

    const saveBtn = $("#saveBtn");
    const updateBtn = $("#updateBtn");
    const resetBtn = $("#resetBtn");

    rollNoInput.focus();

    // Reset form fields
    function resetForm() {
        rollNoInput.val("");
        fullNameInput.val("").prop("disabled", true);
        classInput.val("").prop("disabled", true);
        birthDateInput.val("").prop("disabled", true);
        addressInput.val("").prop("disabled", true);
        enrollmentDateInput.val("").prop("disabled", true);
        saveBtn.prop("disabled", true);
        updateBtn.prop("disabled", true);
        rollNoInput.prop("disabled", false);
        rollNoInput.focus();
    }

    resetBtn.on('click', resetForm);

    rollNoInput.on('blur', function() {
        const rollNo = rollNoInput.val().trim();
        if (rollNo) {
            const getRequest = createGET_BY_KEYRequest(connToken, dbName, relName, JSON.stringify({ rollNo }));
            jQuery.ajaxSetup({ async: false });
            const resJsonObj = executeCommandAtGivenBaseUrl(getRequest, jpdbBaseURL, jpdbIRL);
            jQuery.ajaxSetup({ async: true });

            if (resJsonObj.status === 200) {
                const record = JSON.parse(resJsonObj.data).record;
                fillForm(record);
                updateBtn.prop("disabled", false);
                rollNoInput.prop("disabled", true);
            } else {
                enableFieldsForNewEntry();
                saveBtn.prop("disabled", false);
            }
        }
    });

    saveBtn.on('click', function() {
        const jsonData = validateAndGetFormData();
        if (!jsonData) return;

        const putRequest = createPUTRequest(connToken, jsonData, dbName, relName);
        jQuery.ajaxSetup({ async: false });
        const resJsonObj = executeCommandAtGivenBaseUrl(putRequest, jpdbBaseURL, jpdbIML);
        jQuery.ajaxSetup({ async: true });

        alert("Record saved successfully!");
        resetForm();
    });

    updateBtn.on('click', function() {
        const rollNo = rollNoInput.val().trim();
    
        // Validate and get the form data
        const jsonData = validateAndGetFormData();
        if (!jsonData) return;
    
        // We need the RecNo to update the record. Fetch it first.
        const getRequest = createGET_BY_KEYRequest(connToken, dbName, relName, JSON.stringify({ rollNo }));
        jQuery.ajaxSetup({ async: false });
        const resJsonObj = executeCommandAtGivenBaseUrl(getRequest, jpdbBaseURL, "/api/irl");
        jQuery.ajaxSetup({ async: true });
    
        if (resJsonObj.status === 200) {
            const recNo = JSON.parse(resJsonObj.data).rec_no;  // Get the record number from the response
    
            // Create the UPDATE request using the record number
            const updateRequest = createUPDATERecordRequest(connToken, jsonData, dbName, relName, recNo);
    
            jQuery.ajaxSetup({ async: false });
            const resultObj = executeCommandAtGivenBaseUrl(updateRequest, jpdbBaseURL, jpdbIML);
            jQuery.ajaxSetup({ async: true });
    
            if (resultObj.status === 200) {
                alert("Record updated successfully!");
                resetForm();
            } else {
                alert("Update failed: " + resultObj.message);
            }
        } else {
            alert("Record not found for updating!");
        }
    });

    function enableFieldsForNewEntry() {
        fullNameInput.prop("disabled", false);
        classInput.prop("disabled", false);
        birthDateInput.prop("disabled", false);
        addressInput.prop("disabled", false);
        enrollmentDateInput.prop("disabled", false);
    }

    function validateAndGetFormData() {
        const rollNo = rollNoInput.val().trim();
        const fullName = fullNameInput.val().trim();
        const classVal = classInput.val().trim();
        const birthDate = birthDateInput.val();
        const address = addressInput.val().trim();
        const enrollmentDate = enrollmentDateInput.val();

        if (!rollNo || !fullName || !classVal || !birthDate || !address || !enrollmentDate) {
            alert("All fields are required.");
            return null;
        }

        const jsonObj = {
            rollNo, fullName, class: classVal, birthDate, address, enrollmentDate
        };

        return JSON.stringify(jsonObj);
    }

    function fillForm(record) {
        fullNameInput.val(record.fullName);
        classInput.val(record.class);
        birthDateInput.val(record.birthDate);
        addressInput.val(record.address);
        enrollmentDateInput.val(record.enrollmentDate);
        enableFieldsForNewEntry();
    }
});
