        let processedData = {
            usn: [],
            subjects: {},
            subjectResults: {},
            total: [],
            percentage: [],
            sgpa: [],
            grade: [],
            failCount: [],
            failCountDistribution: {},
            gradeCounters: {
                'FCD': 0,
                'FC': 0,
                'SC': 0,
                'P': 0,
                'F': 0,
                'AB': 0,
                'WH': 0
            }
        };
        let subjectCodes = [];
        let subjectVisibility = {};
        let studentData = null;
        let modalChart = null;
        let studentComparisonChartInstance = null;
        let subjectStats = {};
        let isViewingOriginal = false;
        let currentChartDataset = null;
        let subjectGradeDistributionChartInstance = null;
        function calculateSubjectStats(subjectCode) {
            const stats = {
                total: 0,
                pass: 0,
                fail: 0,
                absent: 0,
                withheld: 0,
                fcd: 0,
                fc: 0,
                sc: 0,
                p_grade: 0,
                marks: [],
                grades: {},
                highestMark: -1,
                lowestMark: 101,
                topperUsn: '-',
                lowestMarkUsn: '-'
            };

            if (!studentData || !studentData.subjects || !studentData.subjects[subjectCode]) {
                return stats;
            }

            const subjectMarks = studentData.subjects[subjectCode];
            const subjectGrades = studentData.grades[subjectCode];

            subjectMarks.forEach((mark, index) => {
                const usn = studentData.usn[index];
                const grade = subjectGrades ? subjectGrades[index] : null;

                if (mark === 'AB' || mark === 'WH' || mark === null || mark === undefined) {
                    if (mark === 'AB') stats.absent++;
                    if (mark === 'WH') stats.withheld++;
                } else if (typeof mark === 'number' && !isNaN(mark)) {
                    stats.total++;
                    stats.marks.push(mark);
                    if (mark >= 40) {
                        stats.pass++;
                    } else {
                        stats.fail++;
                    }

                    if (mark > stats.highestMark) {
                        stats.highestMark = mark;
                        stats.topperUsn = usn;
                    }
                    if (mark < stats.lowestMark) {
                        stats.lowestMark = mark;
                        stats.lowestMarkUsn = usn;
                    }
                    if (grade) {
                        stats.grades[grade] = (stats.grades[grade] || 0) + 1;
                        if (grade === 'FCD') stats.fcd++;
                        else if (grade === 'FC') stats.fc++;
                        else if (grade === 'SC') stats.sc++;
                        else if (grade === 'P') stats.p_grade++;
                    }

                } else {
                    console.warn(`Unexpected mark value '${mark}' for ${usn} in ${subjectCode}`);
                }
            });
            if (stats.marks.length === 0) {
                stats.lowestMark = '-';
                stats.highestMark = '-';
            } else {
                if (stats.lowestMark === 101) stats.lowestMark = Math.min(...stats.marks);
            }


            return stats;
        }
        function generateSubjectAnalysisChart(selectedSubject) {
            if (!selectedSubject || !studentData) {
                if (subjectGradeDistributionChartInstance) {
                    subjectGradeDistributionChartInstance.destroy();
                    subjectGradeDistributionChartInstance = null;
                }
                document.getElementById('subjectStatsReport').style.display = 'none';
                return;
            }
            document.getElementById('subjectStatsReport').style.display = 'block';
            const stats = calculateSubjectStats(selectedSubject);
            subjectStats[selectedSubject] = stats;
            document.getElementById('statsTotalStudents').textContent = stats.total;
            const passPercentage = stats.total > 0 ? ((stats.pass / stats.total) * 100).toFixed(2) : 0;
            document.getElementById('statsPassPercentage').textContent = passPercentage;
            const averageMarks = stats.marks.length > 0 ? (stats.marks.reduce((a, b) => a + b, 0) / stats.marks.length).toFixed(2) : '-';
            document.getElementById('statsAverageMarks').textContent = averageMarks;
            document.getElementById('statsHighestMarks').textContent = stats.highestMark;
            document.getElementById('statsTopperUsn').textContent = stats.topperUsn;
            document.getElementById('statsLowestMarks').textContent = stats.lowestMark;
            const gradeCountsContainer = document.getElementById('gradeCountsDisplay');
            gradeCountsContainer.innerHTML = '<h5>Grade Counts:</h5>';
            const gradeOrder = ['FCD', 'FC', 'SC', 'P', 'F', 'AB', 'WH'];
            let gradeContent = '';
            gradeOrder.forEach(grade => {
                let count = 0;
                if (grade === 'F') count = stats.fail;
                else if (grade === 'AB') count = stats.absent;
                else if (grade === 'WH') count = stats.withheld;
                else count = stats.grades[grade] || 0;

                if (count > 0) {
                    gradeContent += `<span>${grade}: ${count}</span> `;
                }
            });
            if (!gradeContent) gradeContent = '<span>No grade data available</span>';
            gradeCountsContainer.innerHTML += gradeContent;
            const ctx = document.getElementById('subjectGradeDistributionChart').getContext('2d');
            if (subjectGradeDistributionChartInstance) {
                subjectGradeDistributionChartInstance.destroy();
            }
            const gradeChartLabels = [];
            const gradeChartData = [];
            gradeOrder.forEach(grade => {
                let count = 0;
                if (grade === 'F') count = stats.fail;
                else if (grade === 'AB') count = stats.absent;
                else if (grade === 'WH') count = stats.withheld;
                else count = stats.grades[grade] || 0;
                gradeChartLabels.push(grade);
                gradeChartData.push(count);
            });
            if (gradeChartData.reduce((a, b) => a + b, 0) === 0) {
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--secondary-text').trim();
                ctx.textAlign = 'center';
                ctx.fillText('No grade data available for this subject', ctx.canvas.width / 2, ctx.canvas.height / 2);
                subjectGradeDistributionChartInstance = null;
                return;
            }
            const chartColors = getColorsWithOpacity(gradeChartLabels.length);
            const computedStyle = getComputedStyle(document.documentElement);
            const chartTextColor = computedStyle.getPropertyValue('--chart-text-color').trim();
            const chartGridColor = computedStyle.getPropertyValue('--chart-grid-color').trim();
            subjectGradeDistributionChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: gradeChartLabels,
                    datasets: [{
                        label: 'Number of Students',
                        data: gradeChartData,
                        backgroundColor: chartColors.colors,
                        borderColor: chartColors.borderColors,
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: `Grade Distribution for ${selectedSubject}`,
                            color: chartTextColor,
                            font: { size: 16 }
                        },
                        legend: { display: false }
                    },
                    scales: {
                        x: {
                            title: { display: true, text: 'Grade', color: chartTextColor },
                            ticks: { color: chartTextColor },
                            grid: { color: chartGridColor }
                        },
                        y: {
                            beginAtZero: true,
                            title: { display: true, text: 'Number of Students', color: chartTextColor },
                            ticks: { color: chartTextColor, stepSize: 1 },
                            grid: { color: chartGridColor }
                        }
                    }
                }
            });
        }
        document.getElementById('subjectSelect').addEventListener('change', function () {
            generateSubjectAnalysisChart(this.value);
        });
        function populateSubjectSelect() {
            const select = document.getElementById('subjectSelect');
            select.innerHTML = '<option value="">-- Select Subject --</option>';

            if (subjectCodes && subjectCodes.length > 0) {
                subjectCodes.sort().forEach(code => {
                    const option = document.createElement('option');
                    option.value = code;
                    option.textContent = code;
                    select.appendChild(option);
                });
                
                // Select first subject and generate chart by default
                if (select.options.length > 1) {
                    select.selectedIndex = 1;
                    const selectedSubject = select.value;
                    setTimeout(() => {
                        generateSubjectAnalysisChart(selectedSubject);
                    }, 500);
                }
                
            } else {
                console.log("No subject codes available to populate select.");
            }
        }

        function generateSubjectAnalysisChart(selectedSubject) {
            if (!selectedSubject || !studentData) {
                if (subjectAnalysisChartInstance) {
                    subjectAnalysisChartInstance.destroy();
                    subjectAnalysisChartInstance = null;
                }
                document.getElementById('subjectStatsSummary').style.display = 'none';
                return;
            }
            
            // Mobile detection
            const isMobile = window.innerWidth < 768;
            const isSmallMobile = window.innerWidth < 480;
            
            document.getElementById('subjectStatsSummary').style.display = 'block';
            
            const subjectMarks = studentData.subjects[selectedSubject] || [];
            const ranges = ['0-10', '11-20', '21-30', '31-40', '41-50', '51-60', '61-70', '71-80', '81-90', '91-100'];
            const distribution = Array(ranges.length).fill(0);
            
            subjectMarks.forEach(mark => {
                if (mark !== null && mark !== undefined && !isNaN(mark)) {
                    const validMark = Math.max(0, Math.min(100, mark));
                    const rangeIndex = validMark === 100 ? 9 : Math.floor(validMark / 10);
                    if (rangeIndex >= 0 && rangeIndex < ranges.length) {
                        distribution[rangeIndex]++;
                    }
                }
            });
            
            // Calculate subject statistics
            const passCount = studentData.subjectResults[selectedSubject]?.pass || 0;
            const failCount = studentData.subjectResults[selectedSubject]?.fail || 0;
            const absentCount = studentData.subjectResults[selectedSubject]?.absent || 0;
            const withheldCount = studentData.subjectResults[selectedSubject]?.withheld || 0;
            const totalCount = passCount + failCount + absentCount + withheldCount;
            const passPercentage = totalCount > 0 ? ((passCount / totalCount) * 100).toFixed(1) : 0;
            
            // Create chart
            const ctx = document.getElementById('subjectAnalysisChart').getContext('2d');
            
            if (subjectAnalysisChartInstance) {
                subjectAnalysisChartInstance.destroy();
            }
            
            const computedStyle = getComputedStyle(document.documentElement);
            const chartTextColor = computedStyle.getPropertyValue('--chart-text-color').trim();
            const chartGridColor = computedStyle.getPropertyValue('--chart-grid-color').trim();
            
            const chartData = {
                labels: ranges,
                datasets: [{
                    label: 'Number of Students',
                    data: distribution,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    borderRadius: isMobile ? 2 : 4
                }]
            };
            
            subjectAnalysisChartInstance = new Chart(ctx, {
                type: 'bar',
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: {
                        padding: {
                            top: isMobile ? 15 : 20,
                            bottom: isMobile ? 15 : 20,
                            left: isMobile ? 15 : 20,
                            right: isMobile ? 15 : 20
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: `Marks Distribution for ${selectedSubject}`,
                            color: chartTextColor,
                            font: { 
                                size: isMobile ? 14 : 18,
                                weight: 'bold'
                            },
                            padding: {
                                top: isMobile ? 10 : 15,
                                bottom: isMobile ? 15 : 20
                            }
                        },
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#ffffff',
                            bodyColor: '#ffffff',
                            titleFont: {
                                size: isMobile ? 12 : 15
                            },
                            bodyFont: {
                                size: isMobile ? 11 : 13
                            },
                            callbacks: {
                                label: function(context) {
                                    return `${context.parsed.y} students`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: !isSmallMobile,
                                text: 'Marks Range',
                                color: chartTextColor,
                                font: {
                                    size: isMobile ? 11 : 14,
                                    weight: 'bold'
                                }
                            },
                            ticks: {
                                color: chartTextColor,
                                font: {
                                    size: isMobile ? 9 : 12
                                },
                                maxRotation: isMobile ? 45 : 0,
                                minRotation: isMobile ? 45 : 0
                            },
                            grid: {
                                color: chartGridColor,
                                lineWidth: 1
                            }
                        },
                        y: {
                            beginAtZero: true,
                            title: {
                                display: !isSmallMobile,
                                text: 'Number of Students',
                                color: chartTextColor,
                                font: {
                                    size: isMobile ? 11 : 14,
                                    weight: 'bold'
                                }
                            },
                            ticks: {
                                color: chartTextColor,
                                font: {
                                    size: isMobile ? 9 : 12
                                },
                                stepSize: 1
                            },
                            grid: {
                                color: chartGridColor,
                                lineWidth: 1
                            }
                        }
                    }
                }
            });
            
            // Update subject statistics summary
            updateSubjectStatsSummary(selectedSubject, passCount, failCount, absentCount, withheldCount, totalCount, passPercentage, distribution);
        }

        function updateSubjectStatsSummary(subject, passCount, failCount, absentCount, withheldCount, totalCount, passPercentage, distribution) {
            // Get stats for this subject
            const stats = subjectStats[subject] || { avg: 0, min: 0, max: 0 };
            const subjectMarks = studentData.subjects[subject] || [];

            // Calculate additional statistics
            const validMarks = subjectMarks.filter(mark => typeof mark === 'number');
            const sortedMarks = [...validMarks].sort((a, b) => a - b);
            // --- NEW: Calculate Median ---
            const medianMark = sortedMarks.length > 0 ?
                (sortedMarks.length % 2 === 0 ?
                    ((sortedMarks[sortedMarks.length / 2 - 1] + sortedMarks[sortedMarks.length / 2]) / 2).toFixed(1) :
                    sortedMarks[Math.floor(sortedMarks.length / 2)]) : 'N/A';
            // --- END: Calculate Median ---

            // Find top performers
            const topPerformers = studentData.usn.map((usn, index) => ({
                usn: usn,
                mark: subjectMarks[index]
            }))
            .filter(student => typeof student.mark === 'number')
            .sort((a, b) => b.mark - a.mark)
            .slice(0, 1); // Get only the top performer

            // Update the stats summary HTML elements
            const summary = document.getElementById('subjectStatsSummary');
            if (summary) {
                document.getElementById('subjectPassPercent').textContent = `${passPercentage}%`;
                document.getElementById('subjectAvgMarks').textContent = stats.avg.toFixed(2);
                // --- NEW: Update Median ---
                document.getElementById('subjectMedianMarks').textContent = medianMark;
                // --- END: Update Median ---
                document.getElementById('subjectHighestMarks').textContent = stats.max;
                document.getElementById('subjectLowestPassMarks').textContent = sortedMarks.find(mark => mark >= 35) || 'N/A'; // Assuming 35 is passing
                // --- NEW: Update Pass/Fail Counts ---
                document.getElementById('subjectPassCount').textContent = passCount;
                document.getElementById('subjectFailCount').textContent = failCount;
                // --- END: Update Pass/Fail Counts ---
                document.getElementById('subjectTopper').textContent = topPerformers.length > 0 ? `${topPerformers[0].usn} (${topPerformers[0].mark})` : 'N/A';

                summary.style.display = 'block';
            }
        }

        function populateSubjectSelect() {
            const select = document.getElementById('subjectSelect');
            select.innerHTML = '<option value="">-- Select Subject --</option>';

            if (subjectCodes && subjectCodes.length > 0) {
                subjectCodes.sort().forEach(code => {
                    const option = document.createElement('option');
                    option.value = code;
                    option.textContent = code;
                    select.appendChild(option);
                });
                document.getElementById('subjectStatsReport').style.display = 'none';
            } else {
                console.log("No subject codes available to populate select.");
            }
        }
        function processData(data) {
            studentData = data;
            subjectCodes = data.subjectCodes || [];
            subjectVisibility = Object.fromEntries(subjectCodes.map(code => [code, true]));

            populateDataTable();
            populateStudentSelect();
            populateSubjectSelect();
            populateFilterCheckboxes();
            generateAllCharts();
            updateDashboardStats();

            document.getElementById('loadingOverlay').style.display = 'none';
            showToast('Data processed successfully!', 3000);
        }
        function getColorsWithOpacity(count, opacity = '80') {
            const style = getComputedStyle(document.documentElement);
            const colorPalette = [
                style.getPropertyValue('--color-1').trim(),
                style.getPropertyValue('--color-2').trim(),
                style.getPropertyValue('--color-3').trim(),
                style.getPropertyValue('--color-4').trim(),
                style.getPropertyValue('--color-5').trim(),
                style.getPropertyValue('--color-6').trim(),
                style.getPropertyValue('--color-7').trim(),
                style.getPropertyValue('--color-8').trim(),
                style.getPropertyValue('--color-9').trim(),
                style.getPropertyValue('--color-10').trim()
            ];
            const colors = [];
            const borderColors = [];
            for (let i = 0; i < count; i++) {
                const baseColor = colorPalette[i % colorPalette.length];
                const validOpacity = /^[0-9A-Fa-f]{2}$/.test(opacity) ? opacity : '80';
                colors.push(baseColor + validOpacity);
                borderColors.push(baseColor);
            }
            return { colors, borderColors };
        }

        window.addEventListener('load', function () {
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') {
                    closeModal();
                }
                if (e.ctrlKey && e.key === 'd') {
                    document.getElementById('themeToggle').click();
                }
            });
        });
        function parseNumericValue(value) {
            if (value === null || value === undefined) return 0;
            if (typeof value === 'number') return value;
            if (typeof value === 'string') {
                if (value.includes('A_')) return 0;
                if (value.includes('F_')) {
                    const numericPart = value.replace('F_', '');
                    return parseFloat(numericPart) || 0;
                }
                const numericString = value.replace(/[^\d.-]/g, '');
                const parsedValue = parseFloat(numericString);
                return isNaN(parsedValue) ? 0 : parsedValue;
            }
            return 0;
        }
        function parseSubjectMark(value) {
            if (value === null || value === undefined) return 0;
            if (typeof value === 'number') return value;
            if (typeof value === 'string') {
                const lowerValue = value.toLowerCase();
                if (lowerValue.includes('a_') || lowerValue.includes('ab') || lowerValue.includes('absent') || lowerValue === 'a') return 0;
                if (lowerValue.includes('f_')) {
                    const numericPart = value.replace('F_', '');
                    return parseFloat(numericPart) || 0;
                }
                if (lowerValue.includes('wh') || lowerValue.includes('withheld')) return 0;

                const numericString = value.replace(/[^\d.-]/g, '');
                const parsedValue = parseFloat(numericString);
                return isNaN(parsedValue) ? 0 : parsedValue;
            }
            return 0;
        }
        function populateDataTable(data) {
            if (!data || !data.usn || data.usn.length === 0) {
                console.warn("No data provided to populate table.");
                return;
            }
            const tableHead = document.querySelector('#dataTable thead tr');
            const modalTableHead = document.querySelector('#modalDataTable thead tr');
            const tableBody = document.getElementById('dataTableBody');
            const modalTableBody = document.getElementById('modalDataTableBody');
            tableHead.innerHTML = '<th>USN</th>';
            modalTableHead.innerHTML = '<th>USN</th>';
            tableBody.innerHTML = '';
            modalTableBody.innerHTML = '';
            const subjectCodes = Object.keys(data.subjects || {});
            subjectCodes.forEach(code => {
                const th = document.createElement('th');
                th.textContent = code;
                tableHead.appendChild(th.cloneNode(true));
                modalTableHead.appendChild(th);
            });
            ['Total', 'SGPA', 'Grade', 'Fail Count'].forEach(headerText => {
                const th = document.createElement('th');
                th.textContent = headerText;
                tableHead.appendChild(th.cloneNode(true));
                modalTableHead.appendChild(th);
            });
            for (let i = 0; i < data.usn.length; i++) {
                const row = document.createElement('tr');
                const usnCell = document.createElement('td');
                usnCell.textContent = data.usn[i];
                row.appendChild(usnCell);
                subjectCodes.forEach(code => {
                    const markCell = document.createElement('td');
                    const mark = (data.subjects[code] && data.subjects[code][i] !== undefined) ? data.subjects[code][i] : 'N/A';
                    markCell.textContent = mark;
                    if (typeof mark === 'number' && mark < 35) {
                        markCell.style.color = 'red';
                    }
                    row.appendChild(markCell);
                });
                const totalCell = document.createElement('td');
                totalCell.textContent = (data.total && data.total[i] !== undefined) ? data.total[i] : 'N/A';
                row.appendChild(totalCell);
                const sgpaCell = document.createElement('td');
                sgpaCell.textContent = (data.sgpa && data.sgpa[i] !== undefined) ? data.sgpa[i].toFixed(2) : 'N/A';
                row.appendChild(sgpaCell);
                const gradeCell = document.createElement('td');
                const grade = (data.grade && data.grade[i] !== undefined) ? data.grade[i] : 'N/A';
                gradeCell.textContent = grade;
                if (grade === 'FCD') {
                    gradeCell.style.color = 'green';
                    gradeCell.style.fontWeight = 'bold';
                } else if (grade === 'F' || grade === 'AB' || grade === 'WH') {
                    gradeCell.style.color = 'red';
                    gradeCell.style.fontWeight = 'bold';
                }
                row.appendChild(gradeCell);
                const failCountCell = document.createElement('td');
                failCountCell.textContent = (data.failCount && data.failCount[i] !== undefined && data.failCount[i] !== null) ? data.failCount[i] : '0';
                row.appendChild(failCountCell);
                tableBody.appendChild(row.cloneNode(true));
                modalTableBody.appendChild(row);
            }
            console.log(`Populated table with ${data.usn.length} rows.`);
        }
        function toggleDataTable() {
            const tableContainer = document.getElementById('dataTableContainer');
            const toggleText = document.getElementById('toggleTableText');

            if (tableContainer.style.display === 'none') {
                tableContainer.style.display = 'block';
                toggleText.textContent = 'Hide Data Table';
            } else {
                tableContainer.style.display = 'none';
                toggleText.textContent = 'Show Data Table';
            }
        }
        function toggleModalDataTable() {
            const tableContainer = document.getElementById('modalDataTableContainer');
            const toggleText = document.getElementById('modalTableToggleText');

            if (tableContainer.style.display === 'none') {
                tableContainer.style.display = 'block';
                toggleText.textContent = 'Hide Data';
            } else {
                tableContainer.style.display = 'none';
                toggleText.textContent = 'Show Data';
            }
        }
        function generateAllCharts() {
            if (!studentData) {
                showToast('No data available to generate charts', 3000);
                return;
            }
            document.getElementById('loadingSpinner').classList.add('active');
            const gallery = document.getElementById('chartGallery');
            gallery.innerHTML = '';
            createChartGalleryItem('Grade Distribution', 'Distribution of student grades (FCD, FC, SC, P, F, AB, WH)', 'distribution', 'pie', 'gradeDistribution');
            createChartGalleryItem('Subject Pass/Fail', 'Pass vs Fail/Absent/Withheld count per subject', 'comparison', 'bar', 'subjectPassFail');
            createChartGalleryItem('SGPA Distribution', 'Distribution of student SGPAs (0-10)', 'performance', 'bar', 'sgpaDistribution');
            // --- Update Title and Description ---
            createChartGalleryItem('Fail Count per Subject', 'Number of students who failed (incl. AB/WH) each subject', 'performance', 'bar', 'failCountHistogram');
            // --- End Update ---
            createChartGalleryItem('Subject Marks Overview', 'Marks distribution across subjects (use modal for details)', 'analysis', 'bar', 'subjectMarksScatter');
            document.getElementById('loadingSpinner').classList.remove('active');
            showToast('Gallery charts generated successfully');
        }
        function getChartDataByType(dataType, chartType) {
            if (!studentData) {
                console.error("getChartDataByType called but studentData is null");
                return null;
            }
            let labels = [];
            let datasets = [];
            const style = getComputedStyle(document.documentElement);
            const visibleSubjects = subjectCodes.filter(code => subjectVisibility[code]);

            try {
                switch (dataType) {
                    case 'gradeDistribution':
                        const gradeLabels = Object.keys(studentData.gradeCounters).filter(
                            grade => studentData.gradeCounters[grade] > 0
                        );
                        const gradeCounts = gradeLabels.map(grade => studentData.gradeCounters[grade]);
                        const totalStudentsGrade = gradeCounts.reduce((a, b) => a + b, 0);
                        const gradeColors = getColorsWithOpacity(gradeLabels.length);
                        const readableLabels = gradeLabels.map(grade => {
                            const percentage = totalStudentsGrade > 0 ? ((studentData.gradeCounters[grade] / totalStudentsGrade) * 100).toFixed(1) : 0;
                            let label;
                            switch (grade) {
                                case 'FCD': label = 'Distinction'; break;
                                case 'FC': label = 'First Class'; break;
                                case 'SC': label = 'Second Class'; break;
                                case 'P': label = 'Pass'; break;
                                case 'F': label = 'Fail'; break;
                                case 'AB': label = 'Absent'; break;
                                case 'WH': label = 'Withheld'; break;
                                default: label = grade;
                            }
                            return `${label}: ${percentage}%`;
                        });

                        labels = readableLabels;
                        datasets = [{
                            label: 'Number of Students',
                            data: gradeCounts,
                            backgroundColor: gradeColors.colors,
                            borderColor: gradeColors.borderColors,
                            borderWidth: 1,
                            hoverOffset: 8
                        }];
                        break;

                    case 'subjectPassFail':
                        if (visibleSubjects.length === 0) return { labels: [], datasets: [] };
                        if (!studentData.subjectResults) {
                            console.error("subjectResults data is missing in studentData");
                            return { labels: [], datasets: [] };
                        }
                        const passCounts = visibleSubjects.map(code => studentData.subjectResults[code]?.pass || 0);
                        const failEtcCounts = visibleSubjects.map(code =>
                            (studentData.subjectResults[code]?.fail || 0) +
                            (studentData.subjectResults[code]?.absent || 0) +
                            (studentData.subjectResults[code]?.withheld || 0)
                        );
                        labels = visibleSubjects;
                        // --- End Label Assignment ---
                        datasets = [
                            {
                                label: 'Pass',
                                data: passCounts,
                                backgroundColor: getColorsWithOpacity(1, '80').colors[0],
                                borderColor: getColorsWithOpacity(1).borderColors[0],
                                borderWidth: 1,
                                stack: 'subjectStack' // Ensure stacking for bar charts
                            },
                            {
                                label: 'Fail/AB/WH',
                                data: failEtcCounts,
                                backgroundColor: getColorsWithOpacity(2, '80').colors[1], // Use a different color
                                borderColor: getColorsWithOpacity(2).borderColors[1],
                                borderWidth: 1,
                                stack: 'subjectStack' // Ensure stacking for bar charts
                            }
                        ];
                        break;

                    case 'subjectMarksScatter':
                        if (visibleSubjects.length === 0) return { labels: [], datasets: [] };
                        const scatterData = [];
                        visibleSubjects.forEach((subjectCode, subjectIndex) => {
                            studentData.usn.forEach((usn, studentIndex) => {
                                const mark = studentData.subjects[subjectCode]?.[studentIndex];
                                if (typeof mark === 'number') {
                                    scatterData.push({
                                        x: subjectCode,
                                        y: mark,
                                        usn: usn,
                                        subject: subjectCode
                                    });
                                }
                            });
                        });
                        labels = visibleSubjects;
                        datasets = [{
                            label: 'Student Marks',
                            data: scatterData,
                            backgroundColor: getColorsWithOpacity(1, '60').colors[0],
                            borderColor: getColorsWithOpacity(1).borderColors[0],
                            pointRadius: 4,
                            pointHoverRadius: 6
                        }];
                        break;

                    case 'sgpaDistribution':
                        const sgpaValues = studentData.sgpa.filter(s => typeof s === 'number');
                        if (sgpaValues.length === 0) return { labels: [], datasets: [] };
                        const sgpaRanges = ['0-1', '1-2', '2-3', '3-4', '4-5', '5-6', '6-7', '7-8', '8-9', '9-10'];
                        const sgpaCounts = Array(sgpaRanges.length).fill(0);
                        sgpaValues.forEach(sgpa => {
                            const index = Math.floor(sgpa);
                            if (index >= 0 && index < 10) {
                                sgpaCounts[index]++;
                            } else if (sgpa === 10) {
                                sgpaCounts[9]++;
                            }
                        });
                        labels = sgpaRanges;
                        const sgpaColors = getColorsWithOpacity(sgpaRanges.length);
                        datasets = [{
                            label: 'Number of Students',
                            data: sgpaCounts,
                            backgroundColor: sgpaColors.colors,
                            borderColor: sgpaColors.borderColors,
                            borderWidth: 1
                        }];
                        break;

                    case 'failCountHistogram': // --- Repurposed to show Fail Count Per Subject ---
                        if (visibleSubjects.length === 0) return { labels: [], datasets: [] };
                        if (!studentData.subjectResults) {
                            console.error("subjectResults data is missing in studentData for failCountHistogram");
                            return { labels: [], datasets: [] };
                        }

                        // Get fail counts for each visible subject
                        const failCountsPerSubject = visibleSubjects.map(code =>
                            (studentData.subjectResults[code]?.fail || 0) +
                            (studentData.subjectResults[code]?.absent || 0) + // Optionally include absent/withheld as fails
                            (studentData.subjectResults[code]?.withheld || 0)
                        );

                        // --- Labels are now the subject codes ---
                        labels = visibleSubjects;
                        // --- Data is the fail count for each subject ---
                        const failColors = getColorsWithOpacity(visibleSubjects.length);
                        datasets = [{
                            label: 'Fail/AB/WH Count', // Updated dataset label
                            data: failCountsPerSubject,
                            backgroundColor: failColors.colors,
                            borderColor: failColors.borderColors,
                            borderWidth: 1
                        }];
                        break;

                    default:
                        console.warn(`Unsupported dataType requested: ${dataType}`);
                        return null;
                }
            } catch (error) {
                console.error(`Error generating chart data for ${dataType}:`, error);
                showToast(`Error creating data for ${dataType}: ${error.message}`, 5000);
                return null;
            }

            currentChartDataset = { labels, datasets };
            return { labels, datasets };
        }
        function openModal(imagePath, title, chartType, dataType) { // chartType is now the one passed from the click
            document.getElementById('loadingSpinner').classList.add('active');

            document.getElementById('modalTitle').textContent = title || 'Chart';
            const modalChartTypeSelect = document.getElementById('modalChartType');
            // Set the modal dropdown to the chart type that was actually clicked/current
            modalChartTypeSelect.value = chartType || 'bar';

            // Define the mapping from dataType to the dropdown value
                const groupingMap = {
                    'gradeDistribution': 'grade',
                    'subjectPassFail': 'subjectPassFail', // Keep specific for clarity if needed
                    'studentSubjectComparison': 'comparison', // Assuming this dataType exists
                    'subjectMarksScatter': 'subjectScatter', // Keep specific
                    'sgpaDistribution': 'sgpa', // Keep specific
                    'failCountHistogram': 'failCount', // Keep specific
                    'subjectAnalysis': 'subject', // General subject category
                    'studentAnalysis': 'student', // General student category
                    'topperAnalysis': 'performance' // Assuming this dataType exists
                };

            if (dataType) {
                const modalDataGrouping = document.getElementById('modalDataGrouping');
                // Find the corresponding dropdown value for the given dataType
                const dropdownValue = groupingMap[dataType];
                modalDataGrouping.value = dropdownValue || 'grade'; // Default to 'grade' if not found

                // --- ADD THIS LINE ---
                updateModalChartTypeOptions(modalDataGrouping.value); // Update options based on initial data type
                // --- END ADD ---
            } else {
                 // --- ADD THIS LINE (for safety if dataType is somehow null) ---
                 updateModalChartTypeOptions(document.getElementById('modalDataGrouping').value);
                 // --- END ADD ---
            }


            document.getElementById('modalChart').style.display = 'block';
            document.getElementById('modalImage').style.display = 'none'; // Ensure image is hidden initially
            document.getElementById('chartModal').style.display = 'flex';

            // Set button states correctly
            document.querySelectorAll('.chart-type-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.getAttribute('data-type') === 'interactive') {
                    btn.classList.add('active');
                }
            });
            isViewingOriginal = false; // Ensure we start in interactive mode

            // Update the modal chart with the correct dataType and the passed chartType
            updateModalChart(dataType, chartType);

            document.getElementById('loadingSpinner').classList.remove('active');
        }
        
        function updateModalChart(dataType, chartType) {
            document.getElementById('loadingSpinner').classList.add('active');
        
            // Define dataTypeMap for consistent mapping
            const dataTypeMap = {
                'grade': 'gradeDistribution',
                'sgpa': 'sgpaDistribution',
                'failCount': 'failCountHistogram',
                'subjectPassFail': 'subjectPassFail',
                'subjectScatter': 'subjectMarksScatter',
                'comparison': 'studentSubjectComparison',
                'marks': 'marksDistribution',
                'performance': 'topperAnalysis',
                'analysis': 'subjectMarksScatter',
                'distribution': 'gradeDistribution'
            };
        
            try {
                // Get data type from dropdown if not explicitly provided
                if (!dataType) {
                    const modalDataGrouping = document.getElementById('modalDataGrouping').value;
                    dataType = dataTypeMap[modalDataGrouping];
                    if (!dataType) {
                        console.error("Unknown data grouping selected:", modalDataGrouping);
                        showToast("Selected data grouping is not valid.", 3000);
                        document.getElementById('loadingSpinner').classList.remove('active');
                        return;
                    }
                }
        
                // Get chart type from dropdown if not explicitly provided
                if (!chartType) {
                    chartType = document.getElementById('modalChartType').value;
                }
        
                // --- NEW: Check for incompatible chart type and data type ---
                if (dataType === 'subjectPassFail' && (chartType === 'pie' || chartType === 'doughnut')) {
                    showToast('Pie/Doughnut charts are not suitable for Subject Pass/Fail data. Please select another chart type.', 4000);
                    // Optionally reset the dropdown to a default or previous value if needed
                    // document.getElementById('modalChartType').value = 'bar'; // Example reset
                    document.getElementById('loadingSpinner').classList.remove('active');
                    return; // Prevent chart update
                }
                // --- END: Check ---
        
                if (modalChart) {
                    try {
                        modalChart.destroy();
                    } catch (destroyError) {
                        console.error("Error destroying previous modal chart:", destroyError);
                    } finally {
                        modalChart = null; // Clear the variable reference
                    }
                }
        
                // Get canvas and context AFTER destroying
                const canvas = document.getElementById('modalChart');
                if (!canvas) {
                    console.error("Modal chart canvas element not found!");
                    showToast("Error: Chart canvas element missing.", 4000);
                    document.getElementById('loadingSpinner').classList.remove('active');
                    return;
                }
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    console.error("Failed to get 2D context for modal chart canvas!");
                    showToast("Error: Could not get chart context.", 4000);
                    document.getElementById('loadingSpinner').classList.remove('active');
                    return;
                }
        
                // Manually clear the canvas for a clean slate
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                // --- MODIFICATION END ---
        
                // Get chart data AFTER destroying and clearing
                const chartData = getChartDataByType(dataType, chartType);
                if (!chartData) {
                    showToast(`Could not generate data for ${dataType}`, 4000);
                    document.getElementById('loadingSpinner').classList.remove('active');
                    return; // Exit if no data
                }
        
                const chartTitle = document.getElementById('modalTitle').textContent;
        
                // Style settings
                const computedStyle = getComputedStyle(document.documentElement);
                const chartTextColor = computedStyle.getPropertyValue('--chart-text-color').trim();
                const chartGridColor = computedStyle.getPropertyValue('--chart-grid-color').trim();
                const chartSecondaryTextColor = computedStyle.getPropertyValue('--secondary-text').trim();
        
                // Create chart options (Ensure this part is correct for all chart types)
                const options = {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: chartTitle,
                            color: chartTextColor,
                            font: { size: 18, weight: 'bold' },
                            padding: { top: 10, bottom: 20 }
                        },
                        subtitle: {
                            display: true,
                            text: getChartSubtitle(dataType),
                            color: chartSecondaryTextColor,
                            font: { size: 14, style: 'italic' },
                            padding: { bottom: 10 }
                        },
                        legend: {
                            display: true, // Keep true, Chart.js handles hiding for irrelevant types
                            position: 'top',
                            labels: {
                                color: chartTextColor,
                                padding: 15,
                                usePointStyle: true,
                                pointStyle: 'circle',
                                font: { size: 13, weight: 'bold' }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    let label = context.dataset.label || '';
                                    // Ensure data exists before reducing/accessing
                                    if ((chartType === 'pie' || chartType === 'doughnut' || chartType === 'polarArea') && context.dataset.data) {
                                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                        const value = context.raw;
                                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                        // Ensure labels exist
                                        const segmentLabel = context.chart.data.labels?.[context.dataIndex] || '';
                                        const gradeName = segmentLabel.split(':')[0]; // Safe split even if ':' not present
                                        return `${gradeName}: ${percentage}% (${value} students)`;
                                    } else {
                                        if (label) { label += ': '; }
                                        if (context.parsed?.y !== undefined) { label += context.parsed.y; }
                                        else if (context.parsed !== undefined) { label += context.parsed; } // Fallback for non-cartesian
                                        return label;
                                    }
                                }
                            }
                        }
                    }
                };
        
                // Add scales ONLY for relevant chart types (Chart.js usually handles this, but explicit is safer)
                if (!['pie', 'doughnut', 'radar', 'polarArea'].includes(chartType)) {
                    options.scales = {
                        x: {
                            display: true,
                            title: {
                                display: true,
                                text: getXAxisLabel(dataType),
                                color: chartTextColor,
                                font: { weight: 'bold', size: 14 },
                                padding: { top: 10 }
                            },
                            ticks: {
                                color: chartTextColor,
                                maxRotation: 45,
                                minRotation: 0,
                            },
                            grid: { color: chartGridColor }
                        },
                        y: {
                            display: true,
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: getYAxisLabel(dataType),
                                color: chartTextColor,
                                font: { weight: 'bold', size: 14 },
                                padding: { bottom: 10 }
                            },
                            ticks: { color: chartTextColor },
                            grid: { color: chartGridColor }
                        }
                    };
                } else {
                     // Ensure scales are explicitly removed for radial/pie charts
                     delete options.scales;
                }
        
        
                // Special handling for scatter charts if needed
                if (dataType === 'subjectMarksScatter' && chartType === 'scatter') {
                    // Ensure scales exist before modifying
                    if (!options.scales) options.scales = {};
                    if (!options.scales.x) options.scales.x = { display: true, grid: { color: chartGridColor }, ticks: { color: chartTextColor } }; // Basic x-scale
                    if (!options.scales.y) options.scales.y = { display: true, grid: { color: chartGridColor }, ticks: { color: chartTextColor }, beginAtZero: true }; // Basic y-scale
        
                    options.scales.x.type = 'category'; // Set type
                    options.scales.x.labels = chartData.labels; // Assign labels
                    options.scales.x.title = { display: true, text: getXAxisLabel(dataType), color: chartTextColor, font: { weight: 'bold', size: 14 }, padding: { top: 10 } };
                    options.scales.y.title = { display: true, text: getYAxisLabel(dataType), color: chartTextColor, font: { weight: 'bold', size: 14 }, padding: { bottom: 10 } };
                }
        
                // Use setTimeout to allow DOM updates before creating the new chart instance
                setTimeout(() => {
                    try {
                        // Re-check context just in case
                        const currentCtx = document.getElementById('modalChart')?.getContext('2d');
                        if (!currentCtx) {
                             console.error("Modal chart context lost before creation!");
                             throw new Error("Chart context became unavailable.");
                        }
        
                        // Create the new chart instance
                        modalChart = new Chart(currentCtx, {
                            type: chartType,
                            data: chartData,
                            options: options
                        });
        
                        // Update UI elements
                        const typeSelector = document.getElementById('modalChartType');
                        if (typeSelector && typeSelector.value !== chartType) {
                            typeSelector.value = chartType;
                        }
                        const groupingSelector = document.getElementById('modalDataGrouping');
                        const currentGrouping = Object.keys(dataTypeMap).find(key => dataTypeMap[key] === dataType);
                        if (groupingSelector && currentGrouping && groupingSelector.value !== currentGrouping) {
                             groupingSelector.value = currentGrouping;
                        }
        
                    } catch (error) { // Catch errors during NEW chart instantiation
                        console.error("Error instantiating chart:", error); // Log the specific error
                        const errorCtx = document.getElementById('modalChart')?.getContext('2d');
                        if (errorCtx) { // Display error on canvas
                            errorCtx.clearRect(0, 0, errorCtx.canvas.width, errorCtx.canvas.height);
                            errorCtx.fillStyle = 'red';
                            errorCtx.textAlign = 'center';
                            errorCtx.font = '14px Arial';
                            errorCtx.fillText('Chart Instantiation Error:', errorCtx.canvas.width / 2, errorCtx.canvas.height / 2 - 10);
                            errorCtx.fillText(error.message, errorCtx.canvas.width / 2, errorCtx.canvas.height / 2 + 10);
                        }
                        showToast(`Error creating chart: ${error.message}`, 5000); // Show toast as well
                    } finally {
                        document.getElementById('loadingSpinner').classList.remove('active');
                    }
                }, 0); // Keep timeout short
        
            } catch (error) { // Catch errors in the outer setup (getting data, options etc.)
                console.error("Error preparing chart:", error);
                showToast(`Error preparing chart: ${error.message}`, 4000);
                const ctx = document.getElementById('modalChart')?.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                    ctx.fillStyle = 'red';
                    ctx.textAlign = 'center';
                    ctx.fillText('Chart Setup Error', ctx.canvas.width / 2, ctx.canvas.height / 2);
                }
                document.getElementById('loadingSpinner').classList.remove('active'); // Ensure spinner removed on outer error
            }
        }
        
        function refreshModalChart() {
            updateModalChart();
            showToast('Chart refreshed');
        }
        function switchToOriginalView() {
            const modalImage = document.getElementById('modalImage');
            const modalChart = document.getElementById('modalChart');

            if (modalImage.src && !isViewingOriginal) {
                modalChart.style.display = 'none';
                modalImage.style.display = 'block';
                isViewingOriginal = true;
                document.querySelectorAll('.chart-type-btn').forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.getAttribute('data-type') === 'original') {
                        btn.classList.add('active');
                    }
                });
                showToast('Switched to original image');
            } else {
                modalChart.style.display = 'block';
                modalImage.style.display = 'none';
                isViewingOriginal = false;
                document.querySelectorAll('.chart-type-btn').forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.getAttribute('data-type') === 'interactive') {
                        btn.classList.add('active');
                    }
                });

                showToast('Switched to interactive chart');
            }
        }
        function downloadChart() {
            document.getElementById('loadingSpinner').classList.add('active');

            setTimeout(() => {
                try {
                    let imageURL;
                    const chartTitle = document.getElementById('modalTitle').textContent;

                    if (isViewingOriginal) {
                        imageURL = document.getElementById('modalImage').src;
                    } else {
                        const canvas = document.getElementById('modalChart');
                        imageURL = canvas.toDataURL('image/png');
                    }
                    const link = document.createElement('a');
                    link.href = imageURL;
                    link.download = `${chartTitle.replace(/\s+/g, '_')}_${new Date().getTime()}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    showToast('Chart downloaded successfully');
                } catch (error) {
                    console.error('Error downloading chart:', error);
                    showToast('Error downloading chart: ' + error.message, 5000);
                }
                document.getElementById('loadingSpinner').classList.remove('active');
            }, 500);
        }
        function saveChart() {
            if (!studentData || !currentChartDataset) {
                showToast('No chart data available to save', 3000);
                return;
            }

            const chartType = document.getElementById('modalChartType').value;
            const chartTitle = document.getElementById('modalTitle').textContent;

            const chartConfig = {
                type: chartType,
                title: chartTitle,
                data: currentChartDataset,
                timestamp: new Date().toISOString()
            };
            showToast('Chart configuration saved');
            console.log('Saved chart config:', chartConfig);
        }
        function closeModal() {
            document.getElementById('chartModal').style.display = 'none';
            document.getElementById('modalDataTableContainer').style.display = 'none';
            document.getElementById('modalTableToggleText').textContent = 'Show Data';
            if (modalChart) {
                modalChart.destroy();
                modalChart = null; // Important: Set to null after destroying
            }
        }
        function shareChart() {
            const title = document.getElementById('modalTitle').textContent;
            const shareOptions = [
                { name: "Email", icon: "envelope" },
                { name: "WhatsApp", icon: "whatsapp" },
                { name: "Teams", icon: "users" },
                { name: "Download", icon: "download" }
            ];

            let optionsHTML = "";
            shareOptions.forEach((option, index) => {
                optionsHTML += `<button class="chart-type-btn" onclick="handleShare('${option.name}')">${option.name}</button>`;
            });
            const shareDialog = document.createElement('div');
            shareDialog.style.position = 'absolute';
            shareDialog.style.bottom = '60px';
            shareDialog.style.right = '20px';
            shareDialog.style.background = 'white';
            shareDialog.style.padding = '10px';
            shareDialog.style.borderRadius = '4px';
            shareDialog.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
            shareDialog.innerHTML = `<p style="margin-bottom:10px">Share "${title}"</p>${optionsHTML}`;
            document.querySelector('.modal-actions').appendChild(shareDialog);
            document.addEventListener('click', function closeShareDialog(e) {
                if (!shareDialog.contains(e.target) && !e.target.classList.contains('secondary-btn')) {
                    shareDialog.remove();
                    document.removeEventListener('click', closeShareDialog);
                }
            });
        }

        function handleShare(method) {
            let shareUrl = '';
            let title = document.getElementById('modalTitle').textContent;
            if (isViewingOriginal) {
                shareUrl = document.getElementById('modalImage').src;
            } else {
                const canvas = document.getElementById('modalChart');
                shareUrl = canvas.toDataURL('image/png');
            }

            switch (method) {
                case 'Email':
                    window.open(`mailto:?subject=Sharing ${title}&body=Check out this chart: ${encodeURIComponent(title)}`, '_blank');
                    break;
                case 'WhatsApp':
                    window.open(`https://wa.me/?text=${encodeURIComponent(`Check out this chart: ${title}`)}`, '_blank');
                    break;
                case 'Teams':
                    showToast('Teams sharing would be integrated in production');
                    break;
                case 'Download':
                    downloadChart();
                    break;
                default:
                    showToast(`Sharing via ${method} not implemented`);
            }
        }
        document.getElementById('themeToggle').addEventListener('click', function () {
            document.body.classList.toggle('dark-mode');
            const icon = this.querySelector('i');
            if (document.body.classList.contains('dark-mode')) {
                icon.classList.replace('fa-moon', 'fa-sun');
                localStorage.setItem('theme', 'dark');
                showToast('Dark mode enabled');
            } else {
                icon.classList.replace('fa-sun', 'fa-moon');
                localStorage.setItem('theme', 'light');
                showToast('Light mode enabled');
            }
        });

        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark-mode');
            document.querySelector('#themeToggle i').classList.replace('fa-moon', 'fa-sun');
        }

        function showToast(message, duration = 3000) {
            const toast = document.getElementById('toast');
            toast.textContent = message;
            toast.classList.add('show');

            setTimeout(() => {
                toast.classList.remove('show');
            }, duration);
        }
        document.querySelectorAll('.filter-btn').forEach(button => {
            button.addEventListener('click', function () {
                const filter = this.getAttribute('data-filter');
                document.getElementById('loadingSpinner').classList.add('active');
                document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                setTimeout(() => {
                    const items = document.querySelectorAll('.gallery-item');
                    let visibleCount = 0;
                    items.forEach(item => {
                        if (filter === 'all' || item.getAttribute('data-category') === filter) {
                            item.style.display = 'block';
                            visibleCount++;
                            setTimeout(() => {
                                item.style.opacity = 1;
                                item.style.transform = 'translateY(0)';
                            }, 50);
                        } else {
                            item.style.opacity = 0;
                            item.style.transform = 'translateY(20px)';

                            setTimeout(() => {
                                item.style.display = 'none';
                            }, 300);
                        }
                    });
                    document.getElementById('loadingSpinner').classList.remove('active');
                    showToast(`Showing ${visibleCount} ${filter === 'all' ? 'charts' : filter + ' charts'}`);
                }, 500);
            });
        });
        document.querySelectorAll('.view-btn').forEach(button => {
            button.addEventListener('click', function () {
                document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');

                if (this.title === 'List View') {
                    document.querySelector('.gallery').style.gridTemplateColumns = '1fr';
                } else {
                    document.querySelector('.gallery').style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
                }
            });
        });
        window.addEventListener('click', function (e) {
            const modal = document.getElementById('chartModal');
            if (e.target === modal) {
                closeModal();
            }
        });
        window.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
        const images = ['me.jpg', 'me27.jpg'];
        const selectedImage = images[Math.floor(Math.random() * images.length)];
        const developerImg = document.getElementById('developerImage');
        developerImg.src = selectedImage;
        developerImg.onerror = function () {
            this.src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
            this.onerror = null;
        };
        function loadJsonFile(data) {
    document.getElementById('loadingSpinner').classList.add('active');
    showToast('Processing uploaded data...', 3000);
    
    try {
        // If data is provided directly, process it
        if (Array.isArray(data)) {
            processJsonData(data);
            showToast('Successfully processed uploaded data', 3000);
        } else {
            showToast('Invalid data format', 3000);
        }
    } catch (error) {
        console.error("Error processing data:", error);
        showToast('Error processing data: ' + error.message, 5000);
    } finally {
        document.getElementById('loadingSpinner').classList.remove('active');
    }
}
        function processJsonData(data) {
            try {
                document.getElementById('loadingSpinner').classList.add('active');
                // ... (reset processedData) ...
                processedData = {
                    usn: [],
                    subjects: {},
                    subjectResults: {},
                    total: [],
                    percentage: [],
                    sgpa: [],
                    grade: [],
                    failCount: [],
                    failCountDistribution: {},
                    gradeCounters: { 'FCD': 0, 'FC': 0, 'SC': 0, 'P': 0, 'F': 0, 'AB': 0, 'WH': 0 }
                };

                subjectCodes = extractSubjectCodes(data);
                // ... (initialize processedData.subjects, subjectResults, subjectVisibility) ...
                subjectCodes.forEach(code => {
                    processedData.subjects[code] = [];
                    processedData.subjectResults[code] = { pass: 0, fail: 0, absent: 0, withheld: 0, marks: [] };
                    subjectVisibility[code] = true; // Initialize visibility
                });


                const studentSelect = document.getElementById('studentSelect');
                studentSelect.innerHTML = '<option value="">-- Select USN --</option>'; // Clear previous options

                // ... (loop through data rows to populate processedData) ...
                data.forEach(row => {
                    // ... (data processing logic) ...
                     if (!row || typeof row !== 'object' || !row.USN || typeof row.USN !== 'string' || row.USN.trim() === '' || row.USN.includes('💔')) {
                        console.warn("Skipping invalid row:", row);
                        return;
                    }

                    let studentFailCount = 0;
                    subjectCodes.forEach(code => {
                        const markValue = row[code];
                        const result = processMarkValue(markValue); // Use your processing function
                        processedData.subjects[code].push(result.mark);
                        processedData.subjectResults[code].marks.push(result.mark); // Temporarily store for stats calculation

                        // Update pass/fail/absent/withheld counts for the subject
                        if (result.status === 'fail') {
                            processedData.subjectResults[code].fail++;
                            studentFailCount++;
                        } else if (result.status === 'absent') {
                            processedData.subjectResults[code].absent++;
                            studentFailCount++; // Absent counts as failure for overall grade usually
                        } else if (result.status === 'withheld') {
                            processedData.subjectResults[code].withheld++;
                            studentFailCount++; // Withheld might count as failure
                        } else { // 'pass'
                            processedData.subjectResults[code].pass++;
                        }
                    });

                    // Process Total, %, SGPA, Grade, Fail Count
                    const totalValue = row.Total !== undefined ? parseNumericValue(row.Total) : 0;
                    processedData.total.push(totalValue);
                    const percentValue = row["%"] !== undefined ? parseNumericValue(row["%"]) : 0;
                    processedData.percentage.push(percentValue);
                    const sgpaValue = row.Sgpa !== undefined ? parseNumericValue(row.Sgpa) : 0;
                    processedData.sgpa.push(sgpaValue);

                    const gradeValue = row.Grade !== undefined ? row.Grade : 'F'; // Default to 'F' if missing
                    const grade = determineGrade(gradeValue); // Use your grade determination function
                    processedData.grade.push(grade);

                    // Use Fail count from JSON if available, otherwise use calculated count
                    const failCountFromJson = row["Fail count"];
                    const finalFailCount = (failCountFromJson !== undefined && failCountFromJson !== null) ? parseInt(failCountFromJson) : studentFailCount;
                    processedData.failCount.push(finalFailCount);

                    // Update distributions
                    processedData.failCountDistribution[finalFailCount] = (processedData.failCountDistribution[finalFailCount] || 0) + 1;
                    if (processedData.gradeCounters.hasOwnProperty(grade)) {
                        processedData.gradeCounters[grade]++;
                    } else {
                        console.warn(`Unknown grade encountered: ${grade}`);
                        // Optionally handle unknown grades, e.g., add to a specific counter or ignore
                        processedData.gradeCounters[grade] = 1; // Or handle differently
                    }
                });


                // Calculate subject statistics (Avg, Min, Max) after processing all students
                subjectStats = {};
                subjectCodes.forEach(code => {
                    const marks = processedData.subjectResults[code].marks.filter(m => typeof m === 'number');
                    if (marks.length > 0) {
                        subjectStats[code] = {
                            avg: parseFloat((marks.reduce((a, b) => a + b, 0) / marks.length).toFixed(2)),
                            min: Math.min(...marks),
                            max: Math.max(...marks)
                        };
                    } else {
                        subjectStats[code] = { avg: 0, min: 0, max: 0 }; // Default if no numeric marks
                    }
                    // Clean up temporary marks array
                    delete processedData.subjectResults[code].marks;
                });

                console.log("Subject Stats (Avg, Min, Max):", subjectStats);


                studentData = processedData; // Assign the fully processed data
                console.log("Processed data:", studentData);
                console.log("Grade distribution:", studentData.gradeCounters);
                console.log("Fail count distribution:", studentData.failCountDistribution);


                // Populate UI elements
                populateDataTable(studentData); // Populate the main data table
                // populateStudentSelect(); // Already populated during data processing loop
                populateSubjectSelect(); // *** Make sure this uses the correct function ***
                populateSubjectCheckboxes(); // Populate the visibility checkboxes

                // Display sections
                document.getElementById('dataOptions').style.display = 'block';
                document.getElementById('studentChartSection').style.display = 'block';
                document.getElementById('subjectChartSection').style.display = 'block'; // Ensure this is shown

                // Initial chart generation
                generateAllCharts(); // Generate gallery charts

                // Select first student/subject by default if desired
                if (studentSelect.options.length > 1) {
                     studentSelect.selectedIndex = 1; // Select the first actual student
                     generateStudentComparisonChart(studentSelect.value);
                     updateStudentStatistics(studentSelect.value);
                }
                 const subjectSelectDropdown = document.getElementById('subjectSelect');
                 if (subjectSelectDropdown.options.length > 1) {
                     subjectSelectDropdown.selectedIndex = 1; // Select the first actual subject
                     generateSubjectAnalysisChart(subjectSelectDropdown.value); // Generate its chart
                 }


                // Show summary toast
                const totalStudents = studentData.usn.length;
                const failedStudents = (studentData.gradeCounters.F || 0) + (studentData.gradeCounters.AB || 0) + (studentData.gradeCounters.WH || 0);
                const passPercentage = totalStudents > 0 ? (((totalStudents - failedStudents) / totalStudents) * 100).toFixed(1) : 0;
                showToast(`Successfully processed ${totalStudents} student records. Overall pass rate: ${passPercentage}%`, 4000);

                // Log final state for debugging if needed
                // console.log("Processed data structure:", JSON.stringify(processedData, null, 2));
                console.log("Subject codes:", subjectCodes);
                console.log("Subject visibility:", subjectVisibility);


            } catch (error) {
                console.error('Error processing JSON data:', error);
                showToast('Error processing data: ' + error.message, 5000);
            } finally {
                document.getElementById('loadingSpinner').classList.remove('active');
            }
        }

        // Ensure this is the *only* populateSubjectSelect function
        function populateSubjectSelect() {
            const select = document.getElementById('subjectSelect');
            select.innerHTML = '<option value="">-- Select Subject --</option>'; // Clear existing options

            if (subjectCodes && subjectCodes.length > 0) {
                subjectCodes.sort().forEach(code => {
                    const option = document.createElement('option');
                    option.value = code;
                    option.textContent = code; // Display the subject code
                    select.appendChild(option);
                });
                // Don't automatically generate chart here, let processJsonData handle it after population
            } else {
                console.log("No subject codes available to populate select.");
                // Optionally disable the select or show a message
                select.disabled = true;
            }
        }

        function generateStudentComparisonChart(selectedUsn) {
            if (!studentData || !subjectStats || !selectedUsn) {
                console.warn("Data not ready for student comparison chart.");
                return;
            }
            const studentIndex = studentData.usn.indexOf(selectedUsn);
            if (studentIndex === -1) {
                console.error(`Student USN ${selectedUsn} not found.`);
                return;
            }
            const visibleSubjects = subjectCodes.filter(code => subjectVisibility[code]);
            if (visibleSubjects.length === 0) {
                showToast('Please select at least one subject to display the chart', 3000);
                return;
            }
            const studentMarks = visibleSubjects.map(code => studentData.subjects[code][studentIndex]);
            const avgMarks = visibleSubjects.map(code => subjectStats[code]?.avg || 0);
            const maxMarks = visibleSubjects.map(code => subjectStats[code]?.max || 0);
            const minMarks = visibleSubjects.map(code => subjectStats[code]?.min || 0);
            
            // Calculate appropriate Y-axis maximum
            const allValues = [...studentMarks, ...avgMarks, ...maxMarks, ...minMarks].filter(val => val !== null && val !== undefined && !isNaN(val));
            const dataMax = Math.max(...allValues);
            const yAxisMax = Math.min(100, Math.max(dataMax * 1.1, 100)); // Cap at 100, but allow some padding
            
            // Mobile detection
            const isMobile = window.innerWidth < 768;
            const isSmallMobile = window.innerWidth < 480;
            
            const ctx = document.getElementById('studentComparisonChart').getContext('2d');
            if (studentComparisonChartInstance) {
                studentComparisonChartInstance.destroy();
            }
            const chartData = {
                labels: visibleSubjects,
                datasets: [
                    {
                        label: `${selectedUsn}'s Marks`,
                        data: studentMarks,
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: isMobile ? 1 : 1,
                        barPercentage: isMobile ? 0.8 : 0.6,
                        categoryPercentage: isMobile ? 0.9 : 0.7
                    },
                    {
                        label: 'Class Average',
                        data: avgMarks,
                        backgroundColor: 'rgba(255, 159, 64, 0.6)',
                        borderColor: 'rgba(255, 159, 64, 1)',
                        borderWidth: isMobile ? 1 : 1,
                        barPercentage: isMobile ? 0.8 : 0.6,
                        categoryPercentage: isMobile ? 0.9 : 0.7
                    },
                    {
                        label: 'Class Max',
                        data: maxMarks,
                        type: 'line',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        backgroundColor: 'rgba(54, 162, 235, 0.1)',
                        fill: false,
                        tension: 0.1,
                        pointRadius: isMobile ? 2 : 3,
                        borderDash: [5, 5],
                        borderWidth: isMobile ? 1 : 2
                    },
                    {
                        label: 'Class Min',
                        data: minMarks,
                        type: 'line',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        backgroundColor: 'rgba(255, 99, 132, 0.1)',
                        fill: false,
                        tension: 0.1,
                        pointRadius: isMobile ? 2 : 3,
                        borderDash: [5, 5],
                        borderWidth: isMobile ? 1 : 2
                    }
                ]
            };
            const chartTextColor = '#1E88E5';
            const options = {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        top: isMobile ? 5 : 15,
                        bottom: isMobile ? 5 : 15,
                        left: isMobile ? 5 : 15,
                        right: isMobile ? 5 : 15
                    }
                },
                plugins: {
                    title: {
                        display: !isSmallMobile,
                        text: `Marks Comparison - ${selectedUsn}`,
                        color: chartTextColor,
                        font: { 
                            size: isMobile ? 10 : 16,
                            weight: 'bold'
                        },
                        padding: {
                            top: isMobile ? 2 : 10,
                            bottom: isMobile ? 5 : 15
                        }
                    },
                    legend: {
                        display: !isMobile,
                        position: 'top',
                        labels: {
                            color: chartTextColor,
                            font: {
                                size: 10,
                                weight: 'normal'
                            },
                            padding: 8,
                            boxWidth: 12,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        titleFont: {
                            size: isMobile ? 10 : 13
                        },
                        bodyFont: {
                            size: isMobile ? 9 : 11
                        },
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: false
                        },
                        ticks: {
                            color: chartTextColor,
                            font: {
                                size: isMobile ? 7 : 10
                            },
                            maxRotation: isMobile ? 90 : 45,
                            minRotation: isMobile ? 90 : 0
                        },
                        grid: {
                            display: !isMobile,
                            color: 'rgba(30, 136, 229, 0.1)',
                            lineWidth: 1
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: yAxisMax,
                        title: {
                            display: false
                        },
                        ticks: {
                            color: chartTextColor,
                            font: {
                                size: isMobile ? 7 : 10
                            },
                            stepSize: isMobile ? 25 : 10,
                            callback: function(value) {
                                return value;
                            }
                        },
                        grid: {
                            color: 'rgba(30, 136, 229, 0.1)',
                            lineWidth: 1
                        }
                    }
                },
                interaction: {
                    mode: 'index',
                    intersect: false,
                }
            };
            studentComparisonChartInstance = new Chart(ctx, {
                type: 'bar',
                data: chartData,
                options: options
            });
        }
        function updateStudentStatistics(selectedUsn) {
            if (!studentData || !selectedUsn) return;

            const studentIndex = studentData.usn.indexOf(selectedUsn);
            if (studentIndex === -1) return;

            const statsPanel = document.getElementById('studentStatsSummary');
            const total = studentData.total[studentIndex];
            const percentage = studentData.percentage[studentIndex];
            const sgpa = studentData.sgpa[studentIndex];
            const grade = studentData.grade[studentIndex];
            const failCount = studentData.failCount[studentIndex];

            statsPanel.innerHTML = `
            <h4 style="margin-bottom: 10px;">Statistics for ${selectedUsn}</h4>
            <div class="stat-item">
                <span class="stat-label">Total Marks:</span>
                <span class="stat-value">${total !== null ? total : 'N/A'}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Percentage:</span>
                <span class="stat-value">${percentage !== null ? percentage.toFixed(2) + '%' : 'N/A'}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">SGPA:</span>
                <span class="stat-value">${sgpa !== null ? sgpa.toFixed(2) : 'N/A'}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Grade:</span>
                <span class="stat-value">${grade || 'N/A'}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Fail Count:</span>
                <span class="stat-value">${failCount !== null ? failCount : '0'}</span>
            </div>
        `;
            statsPanel.style.display = 'block';
        }
        window.addEventListener('DOMContentLoaded', function () {
            // Close subject and student sections by default
            setTimeout(() => {
                if (document.getElementById('studentChartContent')) {
                    document.getElementById('studentChartContent').classList.add('collapsed');
                    document.getElementById('studentChartToggle').classList.add('collapsed');
                }
                
                if (document.getElementById('subjectChartContent')) {
                    document.getElementById('subjectChartContent').classList.add('collapsed');
                    document.getElementById('subjectChartToggle').classList.add('collapsed');
                }
            }, 100);
            
            // --- Add this logic for the output folder link ---
            const outputLink = document.getElementById('outputFolderLink');
            if (window.location.protocol === 'file:') {
                // Set the link to point to the 'output' folder relative to the HTML file's parent directory.
                // Assumes 'output' folder is at d:\python\GUI\output
                const outputPath = '../output'; // Relative path from d:\python\GUI\ACSGUI\index.html
                outputLink.href = outputPath;
                outputLink.target = '_blank'; // Attempt to open in a new tab/window
                outputLink.title = 'Open output folder (Note: Browser security might block this)';
                // Remove any previous complex onclick handler if present
                outputLink.onclick = null;
                console.log('Output folder link set to:', outputLink.href);
            } else {
                // If not running from file:///, disable the link and inform the user.
                outputLink.href = '#';
                outputLink.title = 'Opening local folders only works when run directly from disk (file:///)';
                outputLink.style.opacity = '0.6'; // Visually indicate it's less active
                outputLink.style.cursor = 'not-allowed';
                outputLink.onclick = function(event) {
                    event.preventDefault(); // Prevent page jump
                    showToast('This feature requires running the HTML file directly from your disk.', 4000);
                };
                console.log('Output folder link disabled (not running from file:///)');
            }
            // --- End of output folder link logic ---

            
            
            document.getElementById('studentSelect').addEventListener('change', function () {
                const selectedUsn = this.value;
                if (selectedUsn) {
                    generateStudentComparisonChart(selectedUsn);
                    updateStudentStatistics(selectedUsn);
                } else {
                    if (studentComparisonChartInstance) {
                        studentComparisonChartInstance.destroy();
                        studentComparisonChartInstance = null;
                    }
                }
            });
        });
        generateAllCharts();
        function processMarkValue(value) {
            if (value === null || value === undefined) {
                return { mark: 0, status: 'fail' };
            }
            if (typeof value === 'number') {
                return { mark: value, status: value < 35 ? 'fail' : 'pass' }; // Assuming 35 is passing
            }
            if (typeof value === 'string') {
                const lowerValue = value.toLowerCase();
                if (lowerValue.includes('a_') || lowerValue.includes('ab') || lowerValue.includes('absent') || lowerValue === 'a') {
                    return { mark: 0, status: 'absent' };
                }
                if (lowerValue.includes('f_') || lowerValue.includes('fail') || lowerValue === 'f') {
                    const matches = value.match(/\d+(\.\d+)?/);
                    const mark = matches ? parseFloat(matches[0]) : 0;
                    return { mark: mark, status: 'fail' };
                }
                if (lowerValue.includes('wh') || lowerValue.includes('withheld')) {
                    return { mark: 0, status: 'withheld' };
                }
                const numericMatches = value.match(/\d+(\.\d+)?/);
                if (numericMatches) {
                    const numericValue = parseFloat(numericMatches[0]);
                    return { mark: numericValue, status: numericValue < 35 ? 'fail' : 'pass' };
                }
            }
            return { mark: 0, status: 'fail' };
        }
        function determineGrade(gradeValue) {
            if (!gradeValue) return 'F';
            if (typeof gradeValue === 'string') {
                const upperValue = gradeValue.toUpperCase().trim();
                if (upperValue.includes('FCD') || upperValue.includes('DISTINCTION')) return 'FCD';
                if (upperValue.includes('FC') || upperValue.includes('FIRST CLASS')) return 'FC';
                if (upperValue.includes('SC') || upperValue.includes('SECOND')) return 'SC';
                if (upperValue.includes('PASS') || upperValue === 'P') return 'P';
                if (upperValue.includes('FAIL') || upperValue === 'F') return 'F';
                if (upperValue.includes('ABSENT') || upperValue.includes('AB') || upperValue === 'A') return 'AB';
                if (upperValue.includes('WITHHELD') || upperValue.includes('WH')) return 'WH';
            }
            const numericValue = parseFloat(gradeValue);
            if (!isNaN(numericValue)) {
                if (numericValue >= 75) return 'FCD';
                if (numericValue >= 60) return 'FC';
                if (numericValue >= 50) return 'SC';
                if (numericValue >= 35) return 'P';
                return 'F';
            }
            return 'F';
        }
        function createChartGalleryItem(title, description, category, defaultChartType, dataType) {
            const chartId = `chart_${Math.random().toString(36).substr(2, 9)}`;

            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.setAttribute('data-category', category);
            galleryItem.setAttribute('data-type', dataType); // Store dataType
            galleryItem.setAttribute('data-current-chart-type', defaultChartType); // Store current chart type initially

            galleryItem.onclick = function (event) {
                // Prevent modal opening if clicking on buttons inside
                if (event.target.closest('button') || event.target.closest('.view-options')) {
                    return;
                }
                // Pass the currently selected chart type from the data attribute
                openModal(null, title, this.getAttribute('data-current-chart-type'), dataType);
            };
            galleryItem.style.cursor = 'pointer';

            const chartBadge = document.createElement('div');
            chartBadge.className = 'chart-badge';
            chartBadge.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            const chartImageContainer = document.createElement('div');
            chartImageContainer.className = 'chart-image-container';
            const canvas = document.createElement('canvas');
            canvas.id = chartId;
            chartImageContainer.appendChild(canvas);
            const previewOverlay = document.createElement('div');
            previewOverlay.className = 'chart-preview-overlay';

            const previewButton = document.createElement('button');
            previewButton.className = 'preview-button';
            previewButton.innerHTML = '<i class="fas fa-eye"></i> Preview';
            // Make preview button open modal with current chart type
            previewButton.onclick = function(event) {
                event.stopPropagation(); // Prevent gallery item click
                const parentItem = this.closest('.gallery-item');
                const currentType = parentItem.getAttribute('data-current-chart-type'); // Read current type
                const currentDataType = parentItem.getAttribute('data-type');
                const currentTitle = parentItem.querySelector('.chart-title').textContent;
                openModal(null, currentTitle, currentType, currentDataType); // Pass current type
            };
            previewButton.style.pointerEvents = 'auto'; // Ensure button is clickable

            previewOverlay.appendChild(previewButton);
            const chartInfo = document.createElement('div');
            chartInfo.className = 'chart-info';

            const chartTitle = document.createElement('h3');
            chartTitle.className = 'chart-title';
            chartTitle.textContent = title;

            const chartDesc = document.createElement('p');
            chartDesc.className = 'chart-desc';
            chartDesc.textContent = description;

            const chartActions = document.createElement('div');
            chartActions.className = 'chart-actions';

            const viewOptions = document.createElement('div');
            viewOptions.className = 'view-options';
            const chartTypes = {
                'bar': 'fa-chart-bar',
                'line': 'fa-chart-line',
                'pie': 'fa-chart-pie',
                'doughnut': 'fa-circle-notch',
                'scatter': 'fa-braille',
                'radar': 'fa-spider',
                'polarArea': 'fa-chart-pie',
                'horizontalBar': 'fa-bars',
                'stacked': 'fa-layer-group'
            };
            const allowedChartTypes = {
                'gradeDistribution': ['pie', 'doughnut', 'bar', 'polarArea', 'horizontalBar', 'radar'],
                'subjectPassFail': ['bar', 'line', 'radar', 'polarArea', 'stacked', 'horizontalBar'],
                'subjectMarksScatter': ['scatter', 'bubble', 'line', 'bar'],
                'sgpaDistribution': ['bar', 'pie', 'doughnut', 'line', 'radar', 'horizontalBar'],
                'failCountHistogram': ['bar', 'pie', 'doughnut', 'line', 'polarArea', 'horizontalBar', 'stacked']
            };

            const allowedTypes = allowedChartTypes[dataType] || ['bar', 'line', 'pie', 'radar'];
            const displayTypes = allowedTypes.slice(0, 4);

            displayTypes.forEach((type) => {
                const icon = chartTypes[type] || chartTypes.bar;
                const button = document.createElement('button');
                // Use defaultChartType for initial active state
                button.className = `view-option${type === defaultChartType ? ' active' : ''}`;
                button.title = `${type.charAt(0).toUpperCase() + type.slice(1).replace('Bar', ' Bar')} Chart`;
                button.setAttribute('data-chart', type);
                button.innerHTML = `<i class="fas ${icon}"></i>`;
                button.onclick = function (event) {
                    event.stopPropagation();
                    const newChartType = this.getAttribute('data-chart');
                    // Update the gallery item's chart
                    updateGalleryItemChart(canvas, dataType, newChartType);
                    // Update the data attribute storing the current type on the parent gallery item
                    galleryItem.setAttribute('data-current-chart-type', newChartType);
                    // Update active state for buttons
                    viewOptions.querySelectorAll('.view-option').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    this.classList.add('active');
                };

                viewOptions.appendChild(button);
            });

            const chartDate = document.createElement('span');
            chartDate.className = 'chart-date';
            chartDate.textContent = 'Last updated: Today';

            chartActions.appendChild(viewOptions);
            chartActions.appendChild(chartDate);

            chartInfo.appendChild(chartTitle);
            chartInfo.appendChild(chartDesc);
            chartInfo.appendChild(chartActions);
            galleryItem.appendChild(chartBadge);
            galleryItem.appendChild(chartImageContainer);
            galleryItem.appendChild(previewOverlay); // Add overlay containing the button
            galleryItem.appendChild(chartInfo);
            document.getElementById('chartGallery').appendChild(galleryItem);
            // Initial chart rendering
            updateGalleryItemChart(canvas, dataType, defaultChartType);
        }

        function updateGalleryItemChart(canvas, dataType, chartType) {
            const chartData = getChartDataByType(dataType, chartType);
            if (!chartData) {
                console.warn(`No data generated for gallery item: ${dataType}, ${chartType}`);
                return; // Don't proceed if data is null
            }
            const existingChart = Chart.getChart(canvas);
            if (existingChart) {
                existingChart.destroy();
            }

            // Update the parent gallery item's data attribute
            const galleryItem = canvas.closest('.gallery-item');
            if (galleryItem) {
                galleryItem.setAttribute('data-current-chart-type', chartType);
            } else {
                console.warn("Could not find parent gallery item for canvas:", canvas.id);
            }


            const computedStyle = getComputedStyle(document.documentElement);
            const chartTextColor = computedStyle.getPropertyValue('--chart-text-color').trim();
            const chartGridColor = computedStyle.getPropertyValue('--chart-grid-color').trim();

            const options = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false // Keep legend off for small gallery charts
                    },
                    title: {
                        display: false // Keep title off for small gallery charts
                    },
                    tooltip: {
                        enabled: false // Disable tooltips for small gallery charts
                    }
                },
                scales: { // Hide scales for simplicity in gallery view
                    x: {
                        display: false,
                        ticks: { display: false },
                        grid: { display: false }
                    },
                    y: {
                        display: false,
                        ticks: { display: false },
                        grid: { display: false }
                    }
                },
                animation: false // Disable animation for faster updates in gallery
            };

            // Special handling for pie/doughnut in gallery to make them visible
            if (chartType === 'pie' || chartType === 'doughnut') {
                options.plugins.legend.display = false; // Still keep legend off
            }

            try {
                new Chart(canvas, {
                    type: chartType,
                    data: chartData,
                    options: options
                });
            } catch (error) {
                console.error(`Error creating gallery chart (${chartType}, ${dataType}):`, error);
                // Optionally display an error message on the canvas
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = 'red';
                ctx.textAlign = 'center';
                ctx.fillText('Chart Error', canvas.width / 2, canvas.height / 2);
            }
        }
        function getChartSubtitle(dataType) {
            switch (dataType) {
                case 'gradeDistribution':
                    return 'Overall distribution of final grades (FCD, FC, SC, P, F, AB, WH)';
                case 'subjectPassFail':
                    return 'Comparison of students passing vs. failing/absent/withheld in each subject';
                case 'subjectMarksScatter':
                    return 'Individual student marks plotted for each subject';
                case 'sgpaDistribution':
                    return 'Distribution of student SGPA scores across defined ranges';
                case 'failCountHistogram': // Updated name based on usage
                    return 'Number of students failing (including Absent/Withheld) per subject';
                case 'studentSubjectComparison':
                    return 'Comparison of a selected student\'s marks against class average/max/min';
                case 'marksDistribution': // Added based on dataTypeMap in updateModalChart
                     return 'Distribution of marks within specific ranges for a selected subject';
                case 'topperAnalysis': // Added based on gallery item
                    return 'Top performing students across different subjects';
                default:
                    return 'Chart showing selected data'; // Generic fallback
            }
        }
        function getXAxisLabel(dataType) {
            switch (dataType) {
                // ... other cases ...
                case 'sgpaDistribution': return 'SGPA Ranges';
                // --- Updated X-axis label ---
                case 'failCountHistogram': return 'Subject Code';
                // --- End update ---
                default: return 'Categories';
            }
        }
        function getYAxisLabel(dataType) {
            switch (dataType) {
                // ... other cases ...
                case 'sgpaDistribution': return ''; // Keep as is or set to 'Number of Students'
                // --- Updated Y-axis label ---
                case 'failCountHistogram': return 'Number of Students Failed';
                 // --- End update ---
                default: return 'Value';
            }
        }
        function toggleSection(contentId) {
            const content = document.getElementById(contentId);
            const toggle = document.getElementById(contentId.replace('Content', 'Toggle'));

            content.classList.toggle('collapsed');
            toggle.classList.toggle('collapsed');
            
            // Add expanded class when not collapsed for proper overflow behavior
            if (!content.classList.contains('collapsed')) {
                setTimeout(() => {
                    content.classList.add('expanded');
                }, 400); // Wait for animation to complete
            } else {
                content.classList.remove('expanded');
            }
        }
        let subjectAnalysisChartInstance = null;
        function generateSubjectAnalysisChart(selectedSubject) {
            if (!studentData || !selectedSubject) {
                console.warn("Data not ready for subject analysis chart.");
                return;
            }
            
            // Mobile detection
            const isMobile = window.innerWidth < 768;
            const isSmallMobile = window.innerWidth < 480;
            
            const subjectMarks = studentData.subjects[selectedSubject] || [];
            const ranges = ['0-10', '11-20', '21-30', '31-40', '41-50', '51-60', '61-70', '71-80', '81-90', '91-100'];
            const distribution = Array(ranges.length).fill(0);
            subjectMarks.forEach(mark => {
                if (mark !== null && mark !== undefined && !isNaN(mark)) {
                    const validMark = Math.max(0, Math.min(100, mark));
                    const rangeIndex = validMark === 100 ? 9 : Math.floor(validMark / 10);
                    if (rangeIndex >= 0 && rangeIndex < ranges.length) {
                        distribution[rangeIndex]++;
                    }
                }
            });
            const passCount = studentData.subjectResults[selectedSubject]?.pass || 0;
            const failCount = studentData.subjectResults[selectedSubject]?.fail || 0;
            const absentCount = studentData.subjectResults[selectedSubject]?.absent || 0;
            const withheldCount = studentData.subjectResults[selectedSubject]?.withheld || 0;
            const totalCount = passCount + failCount + absentCount + withheldCount;
            const borderlineFailCount = subjectMarks.filter(mark => mark >= 25 && mark < 35).length;
            const significantFailCount = subjectMarks.filter(mark => mark < 25).length;
            const stats = subjectStats[selectedSubject] || { avg: 0, min: 0, max: 0 };
            const passPercentage = totalCount > 0 ? ((passCount / totalCount) * 100).toFixed(1) : 0;
            const failPercentage = totalCount > 0 ? ((failCount / totalCount) * 100).toFixed(1) : 0;
            const absentPercentage = totalCount > 0 ? ((absentCount / totalCount) * 100).toFixed(1) : 0;
            const sortedMarks = [...subjectMarks].filter(m => typeof m === 'number').sort((a, b) => a - b);
            const medianMark = sortedMarks.length > 0 ?
                (sortedMarks.length % 2 === 0 ?
                    ((sortedMarks[sortedMarks.length / 2 - 1] + sortedMarks[sortedMarks.length / 2]) / 2).toFixed(1) :
                    sortedMarks[Math.floor(sortedMarks.length / 2)]) : 0;
            const ctx = document.getElementById('subjectAnalysisChart').getContext('2d');

            if (subjectAnalysisChartInstance) {
                subjectAnalysisChartInstance.destroy();
            }
            const gradeDistribution = {
                'FCD': 0, 'FC': 0, 'SC': 0, 'P': 0, 'F': 0
            };
            subjectMarks.forEach(mark => {
                if (mark >= 70) gradeDistribution.FCD++;
                else if (mark >= 60) gradeDistribution.FC++;
                else if (mark >= 50) gradeDistribution.SC++;
                else if (mark >= 35) gradeDistribution.P++;
                else gradeDistribution.F++;
            });
            const topPerformers = studentData.usn.map((usn, index) => ({
                usn: usn,
                mark: subjectMarks[index]
            }))
                .filter(student => typeof student.mark === 'number')
                .sort((a, b) => b.mark - a.mark)
                .slice(0, 3);
            const chartData = {
                labels: ranges,
                datasets: [{
                    label: '',
                    data: distribution,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            };

            const chartTextColor = '#1E88E5';
            subjectAnalysisChartInstance = new Chart(ctx, {
                type: 'bar',
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: {
                        padding: {
                            top: isMobile ? 5 : 15,
                            bottom: isMobile ? 5 : 15,
                            left: isMobile ? 5 : 15,
                            right: isMobile ? 5 : 15
                        }
                    },
                    plugins: {
                        title: {
                            display: !isSmallMobile,
                            text: `Distribution - ${selectedSubject}`,
                            color: chartTextColor,
                            font: { 
                                size: isMobile ? 10 : 16,
                                weight: 'bold'
                            },
                            padding: {
                                top: isMobile ? 2 : 10,
                                bottom: isMobile ? 5 : 15
                            }
                        },
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: false
                            },
                            ticks: {
                                color: chartTextColor,
                                font: {
                                    size: isMobile ? 7 : 10
                                },
                                maxRotation: isMobile ? 45 : 0,
                                minRotation: isMobile ? 45 : 0
                            },
                            grid: {
                                display: !isMobile,
                                color: 'rgba(30, 136, 229, 0.1)',
                                lineWidth: 1
                            }
                        },
                        y: {
                            title: {
                                display: false
                            },
                            ticks: {
                                color: chartTextColor,
                                font: {
                                    size: isMobile ? 7 : 10
                                },
                                stepSize: 1,
                                callback: function(value) {
                                    return Number.isInteger(value) ? value : '';
                                }
                            },
                            grid: {
                                color: 'rgba(30, 136, 229, 0.1)',
                                lineWidth: 1
                            }
                        }
                    }
                }
            });

            document.getElementById('subjectStatsSummary').innerHTML = `
        <h4 style="margin-bottom: 15px;">Subject Statistics for ${selectedSubject}</h4>
        
        <div class="stat-section">
            <h5 style="margin: 10px 0; font-size: 1rem; color: var(--text-color);">Overall Statistics</h5>
            <div class="stat-item">
                <span class="stat-label">Total Students:</span>
                <span class="stat-value">${totalCount}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Pass Count:</span>
                <span class="stat-value" style="color: green; font-weight: bold;">${passCount} (${passPercentage}%)</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Fail Count:</span>
                <span class="stat-value" style="color: red; font-weight: bold;">${failCount} (${failPercentage}%)</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Absent:</span>
                <span class="stat-value">${absentCount} (${absentPercentage}%)</span>
            </div>
        </div>
        
        <hr style="margin: 12px 0; border-color: var(--hover-bg);">
        
        <div class="stat-section">
            <h5 style="margin: 10px 0; font-size: 1rem; color: var(--text-color);">Mark Distribution</h5>
            <div class="stat-item">
                <span class="stat-label">Average Marks:</span>
                <span class="stat-value">${stats.avg.toFixed(2)}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Median Marks:</span>
                <span class="stat-value">${medianMark}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Highest Marks:</span>
                <span class="stat-value">${stats.max}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Lowest Marks:</span>
                <span class="stat-value">${stats.min}</span>
            </div>
        </div>
        
        <hr style="margin: 12px 0; border-color: var(--hover-bg);">
        
        <div class="stat-section">
            <h5 style="margin: 10px 0; font-size: 1rem; color: var(--text-color);">Failure Analysis</h5>
            <div class="stat-item">
                <span class="stat-label">Borderline Fails (25-34):</span>
                <span class="stat-value">${borderlineFailCount} (${((borderlineFailCount / totalCount) * 100).toFixed(1)}%)</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Significant Fails (<25):</span>
                <span class="stat-value">${significantFailCount} (${((significantFailCount / totalCount) * 100).toFixed(1)}%)</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Total Fails:</span>
                <span class="stat-value">${failCount} (${failPercentage}%)</span>
            </div>
        </div>
        
        <hr style="margin: 12px 0; border-color: var (--hover-bg);">
        
        <div class="stat-section">
            <h5 style="margin: 10px 0; font-size: 1rem; color: var(--text-color);">Grade Distribution</h5>
            <div class="stat-item">
                <span class="stat-label">First Class Distinction (70+):</span>
                <span class="stat-value">${gradeDistribution.FCD} (${Math.round((gradeDistribution.FCD / totalCount) * 100) || 0}%)</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">First Class (60-69):</span>
                <span class="stat-value">${gradeDistribution.FC} (${Math.round((gradeDistribution.FC / totalCount) * 100) || 0}%)</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Second Class (50-59):</span>
                <span class="stat-value">${gradeDistribution.SC} (${Math.round((gradeDistribution.SC / totalCount) * 100) || 0}%)</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Pass (35-49):</span>
                <span class="stat-value">${gradeDistribution.P} (${Math.round((gradeDistribution.P / totalCount) * 100) || 0}%)</span>
            </div>
        </div>
        
        <hr style="margin: 12px 0; border-color: var (--hover-bg);">
        
        <div class="stat-section">
            <h5 style="margin: 10px 0; font-size: 1rem; color: var(--text-color);">Top Performers</h5>
            ${topPerformers.map((student, index) => `
                <div class="stat-item">
                    <span class="stat-label">#${index + 1}:</span>
                    <span class="stat-value">${student.usn} (${student.mark})</span>
                </div>
            `).join('')}
        </div>
    `;
            document.getElementById('subjectStatsSummary').style.display = 'block';
            addEnhancedSubjectChartTypeSelector(selectedSubject, distribution, ranges);
        }
        function extractSubjectCodes(data) {
            if (!data || data.length === 0) {
                console.error("No data available to extract subject codes");
                return [];
            }
            const firstRow = data[0];
            const nonSubjectColumns = ['USN', 'Total', '%', 'Sgpa', 'Grade', 'Fail count'];
            const extractedCodes = [];
            for (const key in firstRow) {
                if (firstRow.hasOwnProperty(key) && !nonSubjectColumns.includes(key)) {
                    extractedCodes.push(key);
                }
            }
            console.log(`Extracted ${extractedCodes.length} subject codes:`, extractedCodes);
            return extractedCodes;
        }
        function populateSubjectCheckboxes() {
            const container = document.getElementById('subjectCheckboxes');
            container.innerHTML = '';
            subjectCodes.forEach(code => {
                const checkboxDiv = document.createElement('div');
                checkboxDiv.style.display = 'flex';
                checkboxDiv.style.alignItems = 'center';
                checkboxDiv.style.backgroundColor = 'var(--light-gray)';
                checkboxDiv.style.padding = '5px 10px';
                checkboxDiv.style.borderRadius = '4px';
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `subject-${code}`;
                checkbox.checked = subjectVisibility[code];
                checkbox.style.marginRight = '5px';
                checkbox.addEventListener('change', function () {
                    subjectVisibility[code] = this.checked;
                    updateChartsWithSubjectVisibility();
                });
                const label = document.createElement('label');
                label.htmlFor = `subject-${code}`;
                label.textContent = code;
                checkboxDiv.appendChild(checkbox);
                checkboxDiv.appendChild(label);
                container.appendChild(checkboxDiv);
            });
        }
        function selectAllSubjects(select) {
            subjectCodes.forEach(code => {
                subjectVisibility[code] = select;
                const checkbox = document.getElementById(`subject-${code}`);
                if (checkbox) checkbox.checked = select;
            });
            updateChartsWithSubjectVisibility();
        }
        function updateChartsWithSubjectVisibility() {
            const selectedStudent = document.getElementById('studentSelect').value;
            if (selectedStudent) {
                generateStudentComparisonChart(selectedStudent);
                updateStudentStatistics(selectedStudent);
            }
            const selectedSubject = document.getElementById('subjectSelect').value;
            if (selectedSubject && subjectVisibility[selectedSubject]) {
                generateSubjectAnalysisChart(selectedSubject);
            } else if (selectedSubject) {
                document.getElementById('subjectSelect').value = '';
                if (subjectAnalysisChartInstance) {
                    subjectAnalysisChartInstance.destroy();
                    subjectAnalysisChartInstance = null;
                    document.getElementById('subjectStatsSummary').style.display = 'block';
                }
            }
            generateAllCharts();
        }
        function addEnhancedSubjectChartTypeSelector(subject, distribution, ranges) {
            if (!document.getElementById('subjectChartTypeSelector')) {
                const selectorDiv = document.createElement('div');
                selectorDiv.style.marginTop = '15px';
                selectorDiv.style.marginBottom = '15px';
                selectorDiv.style.display = 'flex';
                selectorDiv.style.flexWrap = 'wrap';
                selectorDiv.style.gap = '10px';
                selectorDiv.style.alignItems = 'center';

                const label = document.createElement('label');
                label.textContent = 'Chart Type:';
                label.style.fontWeight = '500';
                label.style.color = 'var(--secondary-text)';

                const selector = document.createElement('select');
                selector.id = 'subjectChartTypeSelector';
                selector.className = 'data-select';
                selector.style.width = 'auto';
                selector.style.minWidth = '150px';

                const options = [
                    { value: 'bar', text: 'Bar Chart' },
                    { value: 'line', text: 'Line Chart' },
                    { value: 'pie', text: 'Pie Chart' },
                    { value: 'doughnut', text: 'Doughnut Chart' },
                    { value: 'horizontalBar', text: 'Horizontal Bar Chart' },
                    { value: 'stacked', text: 'Stacked Bar Chart' },
                    { value: 'bubble', text: 'Bubble Chart' }
                ];

                options.forEach(opt => {
                    const option = document.createElement('option');
                    option.value = opt.value;
                    option.textContent = opt.text;
                    selector.appendChild(option);
                });
                selector.onchange = function () {
                    updateSubjectChartType(this.value, subject, distribution, ranges);
                };

                selectorDiv.appendChild(label);
                selectorDiv.appendChild(selector);
                const styleLabel = document.createElement('label');
                styleLabel.textContent = 'Chart Style:';
                styleLabel.style.fontWeight = '500';
                styleLabel.style.color = 'var(--secondary-text)';
                styleLabel.style.marginLeft = '15px';

                const styleSelector = document.createElement('select');
                styleSelector.id = 'chartStyleSelector';
                styleSelector.className = 'data-select';
                styleSelector.style.width = 'auto';
                styleSelector.style.minWidth = '150px';

                const styleOptions = [
                    { value: 'default', text: 'Default Style' },
                    { value: 'pastel', text: 'Pastel Colors' },
                    { value: 'bright', text: 'Bright Colors' },
                    { value: 'monochrome', text: 'Monochrome' },
                    { value: 'gradient', text: 'Gradient Fill' }
                ];

                styleOptions.forEach(opt => {
                    const option = document.createElement('option');
                    option.value = opt.value;
                    option.textContent = opt.text;
                    styleSelector.appendChild(option);
                });

                styleSelector.onchange = function () {
                    updateChartStyle(this.value, subject, distribution, ranges);
                };

                selectorDiv.appendChild(styleLabel);
                selectorDiv.appendChild(styleSelector);
                const chartContainer = document.querySelector('#subjectChartContent .chart-container');
                chartContainer.parentNode.insertBefore(selectorDiv, chartContainer);
            }
        }
        function updateSubjectChartType(chartType, subject, distribution, ranges) {
            if (!subjectAnalysisChartInstance) return;
            let finalChartType = chartType;
            const isHorizontal = chartType === 'horizontalBar';
            const isStacked = chartType === 'stacked';

            if (isHorizontal) finalChartType = 'bar';
            if (isStacked) finalChartType = 'bar';

            subjectAnalysisChartInstance.config.type = finalChartType;

            const currentStyle = document.getElementById('chartStyleSelector')?.value || 'default';
            if (finalChartType === 'pie' || finalChartType === 'doughnut' || finalChartType === 'polarArea') {
                const colorPalette = getColorPaletteByStyle(currentStyle, ranges.length);

                subjectAnalysisChartInstance.data.datasets[0].backgroundColor = colorPalette.colors;
                subjectAnalysisChartInstance.data.datasets[0].borderColor = colorPalette.borders;
                subjectAnalysisChartInstance.options.scales.x.display = false;
                subjectAnalysisChartInstance.options.scales.y.display = false;
                subjectAnalysisChartInstance.options.plugins.legend.display = true;
            } else if (finalChartType === 'radar') {
                const colorPalette = getColorPaletteByStyle(currentStyle, 1);

                subjectAnalysisChartInstance.data.datasets[0].backgroundColor = colorPalette.colors[0] + '50';
                subjectAnalysisChartInstance.data.datasets[0].borderColor = colorPalette.borders[0];
                subjectAnalysisChartInstance.data.datasets[0].pointBackgroundColor = colorPalette.borders[0];
                subjectAnalysisChartInstance.options.scales.x.display = false;
                subjectAnalysisChartInstance.options.scales.y.display = false;
                subjectAnalysisChartInstance.options.plugins.legend.display = true;
            } else if (finalChartType === 'bubble') {
                const bubbleData = distribution.map((value, index) => ({
                    x: index,
                    y: value,
                    r: Math.max(5, Math.sqrt(value) * 3)
                }));

                const colorPalette = getColorPaletteByStyle(currentStyle, ranges.length);

                subjectAnalysisChartInstance.data.datasets[0].data = bubbleData;
                subjectAnalysisChartInstance.data.datasets[0].backgroundColor = colorPalette.colors;
                subjectAnalysisChartInstance.options.scales.x.display = true;
                subjectAnalysisChartInstance.options.scales.y.display = true;
                subjectAnalysisChartInstance.options.scales.x.ticks = {
                    callback: function (val) {
                        return ranges[val];
                    }
                };
            } else {
                const colorPalette = getColorPaletteByStyle(currentStyle, 1);

                subjectAnalysisChartInstance.data.datasets[0].backgroundColor = colorPalette.colors[0];
                subjectAnalysisChartInstance.data.datasets[0].borderColor = colorPalette.borders[0];
                if (Array.isArray(subjectAnalysisChartInstance.data.datasets[0].data) &&
                    typeof subjectAnalysisChartInstance.data.datasets[0].data[0] === 'object') {
                    subjectAnalysisChartInstance.data.datasets[0].data = distribution;
                }
                subjectAnalysisChartInstance.options.scales.x.display = true;
                subjectAnalysisChartInstance.options.scales.y.display = true;
                if (isHorizontal) {
                    subjectAnalysisChartInstance.options.indexAxis = 'y';
                } else {
                    subjectAnalysisChartInstance.options.indexAxis = 'x';
                }
                if (isStacked) {
                    const passData = distribution.map((val, idx) =>
                        idx >= 4 ? val : 0); // >= 40 marks range
                    const failData = distribution.map((val, idx) =>
                        idx < 4 ? val : 0); // < 40 marks range

                    subjectAnalysisChartInstance.data.datasets = [
                        {
                            label: 'Pass',
                            data: passData,
                            backgroundColor: 'rgba(75, 192, 192, 0.6)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1,
                            borderRadius: 4,
                            stack: 'Stack 0'
                        },
                        {
                            label: 'Fail',
                            data: failData,
                            backgroundColor: 'rgba(255, 99, 132, 0.6)',
                            borderColor: 'rgba(255, 99, 132, 1)',
                            borderWidth: 1,
                            borderRadius: 4,
                            stack: 'Stack 0'
                        }
                    ];

                    subjectAnalysisChartInstance.options.scales.x.stacked = true;
                    subjectAnalysisChartInstance.options.scales.y.stacked = true;
                    subjectAnalysisChartInstance.options.plugins.legend.display = true;
                } else {
                    subjectAnalysisChartInstance.options.scales.x.stacked = false;
                    subjectAnalysisChartInstance.options.scales.y.stacked = false;
                    if (subjectAnalysisChartInstance.data.datasets.length > 1) {
                        subjectAnalysisChartInstance.data.datasets = [
                            {
                                label: '',
                                data: distribution,
                                backgroundColor: colorPalette.colors[0],
                                borderColor: colorPalette.borders[0],
                                borderWidth: 1,
                                borderRadius: 4
                            }
                        ];
                    }
                    subjectAnalysisChartInstance.options.plugins.legend.display = false;
                }
            }

            if (finalChartType !== 'bubble') {
                subjectAnalysisChartInstance.options.scales.x.ticks = {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
                };
            }

            subjectAnalysisChartInstance.update();
        }

        function updateChartStyle(style, subject, distribution, ranges) {
            if (!subjectAnalysisChartInstance) return;

            const chartType = document.getElementById('subjectChartTypeSelector')?.value || 'bar';
            updateSubjectChartType(chartType, subject, distribution, ranges);
        }
        function getColorPaletteByStyle(style, count) {
            const baseColors = {
                default: [
                    '#4361EE', '#3A0CA3', '#7209B7', '#F72585', '#4CC9F0',
                    '#4895EF', '#560BAD', '#B5179E', '#F15BB5', '#06D6A0'
                ],
                pastel: [
                    '#FFB5E8', '#B5EAEA', '#ECEAE4', '#FFC9DE', '#A79AFF',
                    '#C5A3FF', '#ECD4FF', '#97C1A9', '#CCE2CB', '#FFFFD8'
                ],
                bright: [
                    '#FF0000', '#FF8700', '#FFD300', '#DEFF0A', '#A1FF0A',
                    '#0AFF99', '#0AEFFF', '#147DF5', '#580AFF', '#BE0AFF'
                ],
                monochrome: [
                    '#0A1931', '#185ADB', '#4E9F3D', '#D8315B', '#1E5128',
                    '#FFD523', '#0E3EDA', '#FC5404', '#1B1A17', '#8E0505'
                ]
            };

            let colors = [];
            let borders = [];

            if (style === 'gradient' && count === 1) {
                colors = ['rgba(75, 192, 192, 0.6)'];
                borders = ['rgba(75, 192, 192, 1)'];
            } else if (style === 'gradient') {
                const gradient = createColorGradient('#4361EE', '#06D6A0', count);
                colors = gradient.map(color => color + '80');
                borders = gradient;
            } else {
                const palette = baseColors[style] || baseColors.default;
                for (let i = 0; i < count; i++) {
                    colors.push(palette[i % palette.length] + '80');
                    borders.push(palette[i % palette.length]);
                }
            }

            return { colors, borders };
        }
        function createColorGradient(startColor, endColor, steps) {
            // Convert hex to RGB
            function hexToRgb(hex) {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16)
                } : null;
            }

            // Convert RGB to hex
            function rgbToHex(r, g, b) {
                return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
            }

            const start = hexToRgb(startColor);
            const end = hexToRgb(endColor);
            const gradient = [];

            for (let i = 0; i < steps; i++) {
                const ratio = i / (steps - 1);
                const r = Math.round(start.r + (end.r - start.r) * ratio);
                const g = Math.round(start.g + (end.g - start.g) * ratio);
                const b = Math.round(start.b + (end.b - start.b) * ratio);
                gradient.push(rgbToHex(r, g, b));
            }

            return gradient;
        }
        function populateStudentSelect() {
            const select = document.getElementById('studentSelect');
            select.innerHTML = ''; // Clear existing options

            if (studentData && studentData.usn && studentData.usn.length > 0) {
                // --- MODIFICATION START: Add default option ---
                const defaultOption = document.createElement('option');
                defaultOption.value = "";
                defaultOption.textContent = "-- Select USN --";
                select.appendChild(defaultOption);
                // --- MODIFICATION END ---

                studentData.usn.forEach((usn, index) => {
                    const option = document.createElement('option');
                    option.value = usn;
                    option.textContent = usn;
                    select.appendChild(option);
                });

                // --- MODIFICATION START: Select default, don't auto-generate chart initially ---
                select.selectedIndex = 0; // Select the "-- Select USN --" option
                // generateStudentComparisonChart(select.value); // Don't generate chart until user selects
                // --- MODIFICATION END ---

                // --- MODIFICATION START: Use correct ID to show the section ---
                document.getElementById('studentChartSection').style.display = 'block';
                // --- MODIFICATION END ---

            } else {
                 // --- MODIFICATION START: Use correct ID to hide the section ---
                document.getElementById('studentChartSection').style.display = 'none';
                 // --- MODIFICATION END ---
                console.log("No student data available to populate select.");
            }
        }

        function processJsonData(data) {
            try {
                document.getElementById('loadingSpinner').classList.add('active');
                // ... (reset processedData) ...
                processedData = {
                    usn: [],
                    subjects: {},
                    subjectResults: {},
                    total: [],
                    percentage: [],
                    sgpa: [],
                    grade: [],
                    failCount: [],
                    failCountDistribution: {},
                    gradeCounters: { 'FCD': 0, 'FC': 0, 'SC': 0, 'P': 0, 'F': 0, 'AB': 0, 'WH': 0 }
                };

                subjectCodes = extractSubjectCodes(data);
                // ... (initialize processedData.subjects, subjectResults, subjectVisibility) ...
                subjectCodes.forEach(code => {
                    processedData.subjects[code] = [];
                    // Ensure subjectResults is initialized correctly for each code
                    processedData.subjectResults[code] = { pass: 0, fail: 0, absent: 0, withheld: 0 };
                    subjectVisibility[code] = true; // Initialize visibility
                });


                const studentSelectDropdown = document.getElementById('studentSelect'); // Get reference early
                studentSelectDropdown.innerHTML = '<option value="">-- Select USN --</option>'; // Clear previous options

                data.forEach(row => {
                    // --- MODIFICATION START: Add extra robust check ---
                    // Ensure 'row' is a valid object before proceeding
                    if (row === null || typeof row !== 'object') {
                         console.warn("Skipping invalid data entry (null or not an object):", row);
                         return; // Skip this iteration
                    }
                    // --- MODIFICATION END ---

                    // Existing check for USN validity
                    if (!row.USN || typeof row.USN !== 'string' || row.USN.trim() === '' || row.USN.includes('💔')) {
                        console.warn("Skipping row with invalid or missing USN:", row);
                        return; // Skips this iteration
                    }

                    const usn = row.USN.trim(); // Get the USN
                    processedData.usn.push(usn); // Add USN to the processed data

                    let studentFailCount = 0;
                    subjectCodes.forEach(code => {
                        // This line should now be safer
                        const markValue = row[code];
                        const result = processMarkValue(markValue); // Use your processing function

                        // Ensure processedData.subjects[code] exists (it should from initialization)
                        if (!processedData.subjects[code]) {
                            processedData.subjects[code] = [];
                        }
                        processedData.subjects[code].push(result.mark);

                        // Ensure processedData.subjectResults[code] exists
                        if (!processedData.subjectResults[code]) {
                             processedData.subjectResults[code] = { pass: 0, fail: 0, absent: 0, withheld: 0 };
                        }

                        // Update pass/fail/absent/withheld counts for the subject
                        if (result.status === 'fail') {
                            processedData.subjectResults[code].fail++;
                            studentFailCount++;
                        } else if (result.status === 'absent') {
                            processedData.subjectResults[code].absent++;
                            studentFailCount++; // Absent counts as failure for overall grade usually
                        } else if (result.status === 'withheld') {
                            processedData.subjectResults[code].withheld++;
                            studentFailCount++; // Withheld might count as failure
                        } else { // 'pass'
                            processedData.subjectResults[code].pass++;
                        }
                    });

                    // Process Total, %, SGPA, Grade, Fail Count
                    const totalValue = row.Total !== undefined ? parseNumericValue(row.Total) : 0;
                    processedData.total.push(totalValue);
                    const percentValue = row["%"] !== undefined ? parseNumericValue(row["%"]) : 0;
                    processedData.percentage.push(percentValue);
                    const sgpaValue = row.Sgpa !== undefined ? parseNumericValue(row.Sgpa) : 0;
                    processedData.sgpa.push(sgpaValue);

                    const gradeValue = row.Grade !== undefined ? row.Grade : 'F'; // Default to 'F' if missing
                    const grade = determineGrade(gradeValue); // Use your grade determination function
                    processedData.grade.push(grade);

                    // Use Fail count from JSON if available, otherwise use calculated count
                    const failCountFromJson = row["Fail count"];
                    const finalFailCount = (failCountFromJson !== undefined && failCountFromJson !== null) ? parseInt(failCountFromJson) : studentFailCount;
                    processedData.failCount.push(finalFailCount);

                    // Update distributions
                    processedData.failCountDistribution[finalFailCount] = (processedData.failCountDistribution[finalFailCount] || 0) + 1;
                    if (processedData.gradeCounters.hasOwnProperty(grade)) {
                        processedData.gradeCounters[grade]++;
                    } else {
                        console.warn(`Unknown grade encountered: ${grade}`);
                        processedData.gradeCounters[grade] = 1; // Or handle differently
                    }
                });


                // Calculate subject statistics (Avg, Min, Max) after processing all students
                subjectStats = {};
                subjectCodes.forEach(code => {
                    // Use processedData.subjects which contains only marks
                    const marks = (processedData.subjects[code] || []).filter(m => typeof m === 'number');
                    if (marks.length > 0) {
                        subjectStats[code] = {
                            avg: parseFloat((marks.reduce((a, b) => a + b, 0) / marks.length).toFixed(2)),
                            min: Math.min(...marks),
                            max: Math.max(...marks)
                        };
                    } else {
                        subjectStats[code] = { avg: 0, min: 0, max: 0 }; // Default if no numeric marks
                    }
                });

                console.log("Subject Stats (Avg, Min, Max):", subjectStats);


                studentData = processedData; // Assign the fully processed data
                console.log("Processed data:", studentData);
                console.log("Grade distribution:", studentData.gradeCounters);
                console.log("Fail count distribution:", studentData.failCountDistribution);


                // Populate UI elements
                populateDataTable(studentData); // Populate the main data table
                populateStudentSelect(); // *** Call the consolidated function HERE ***
                populateSubjectSelect(); // *** Make sure this uses the correct function ***
                populateSubjectCheckboxes(); // Populate the visibility checkboxes

                // Display sections
                document.getElementById('dataOptions').style.display = 'block';
                // studentChartSection display is handled by populateStudentSelect
                document.getElementById('subjectChartSection').style.display = 'block'; // Ensure this is shown

                // Initial chart generation
                generateAllCharts(); // Generate gallery charts

                // Select first student/subject by default if desired
                // --- MODIFICATION: Check if studentSelectDropdown exists before accessing options ---
                if (studentSelectDropdown && studentSelectDropdown.options.length > 1) {
                     studentSelectDropdown.selectedIndex = 0; // Keep default "-- Select USN --"
                     // Don't auto-generate student chart initially
                     // generateStudentComparisonChart(studentSelectDropdown.value);
                     // updateStudentStatistics(studentSelectDropdown.value);
                }
                 const subjectSelectDropdown = document.getElementById('subjectSelect');
                 if (subjectSelectDropdown && subjectSelectDropdown.options.length > 1) {
                     subjectSelectDropdown.selectedIndex = 1; // Select the first actual subject
                     generateSubjectAnalysisChart(subjectSelectDropdown.value); // Generate its chart
                 }


                // Show summary toast
                const totalStudents = studentData.usn.length;
                const failedStudents = (studentData.gradeCounters.F || 0) + (studentData.gradeCounters.AB || 0) + (studentData.gradeCounters.WH || 0);
                const passPercentage = totalStudents > 0 ? (((totalStudents - failedStudents) / totalStudents) * 100).toFixed(1) : 0;
                showToast(`Successfully processed ${totalStudents} student records. Overall pass rate: ${passPercentage}%`, 4000);

                console.log("Subject codes:", subjectCodes);
                console.log("Subject visibility:", subjectVisibility);


            } catch (error) {
                console.error('Error processing JSON data:', error); // Log the specific error
                showToast('Error processing data: ' + error.message, 5000);
            } finally {
                document.getElementById('loadingSpinner').classList.remove('active');
            }
        }
        // ... rest of the script ...

        // ... (rest of the script) ...

        function updateModalChartTypeOptions(currentDataType) {
            const modalChartTypeSelect = document.getElementById('modalChartType');
            const optionsToHide = ['pie', 'doughnut'];
            let shouldHide = currentDataType === 'subjectPassFail'; // Check if the current data type requires hiding

            // --- Ensure default options are always visible ---
            const defaultVisibleOptions = ['bar', 'line', 'radar', 'scatter']; // Add others if needed

            let currentSelectionHidden = false;
            let firstVisibleValue = null;

            for (let option of modalChartTypeSelect.options) {
                if (optionsToHide.includes(option.value) && shouldHide) {
                    option.style.display = 'none'; // Hide the option
                    if (option.selected) {
                        currentSelectionHidden = true;
                    }
                } else {
                    option.style.display = ''; // Ensure option is visible otherwise
                    if (firstVisibleValue === null && defaultVisibleOptions.includes(option.value)) {
                        firstVisibleValue = option.value; // Store the first valid default option
                    }
                }
            }

            // If the currently selected option was hidden, select the first available default option
            if (currentSelectionHidden && firstVisibleValue) {
                modalChartTypeSelect.value = firstVisibleValue;
                // Trigger updateModalChart again because the chart type changed programmatically
                updateModalChart();
            } else if (currentSelectionHidden) {
                 // Fallback if no default found (shouldn't happen with the list above)
                 modalChartTypeSelect.value = 'bar';
                 updateModalChart();
            }
        }
                // Update Dashboard Stats
        function updateDashboardStats() {
            if (!studentData) return;
            
            // Calculate class average
            const validPercentages = studentData.percentage.filter(p => typeof p === 'number' && !isNaN(p));
            const avgPercentage = validPercentages.length > 0 ? 
                (validPercentages.reduce((sum, val) => sum + val, 0) / validPercentages.length).toFixed(2) : 0;
            
            document.getElementById('classAverage').textContent = avgPercentage + '%';
            
            // Calculate pass rate
            const totalStudents = studentData.grade.length;
            const passStudents = studentData.grade.filter(g => g !== 'F' && g !== 'AB' && g !== 'WH').length;
            const passRate = totalStudents > 0 ? ((passStudents / totalStudents) * 100).toFixed(1) : 0;
            
            document.getElementById('classPassRate').textContent = passRate + '%';
            
            // Find top SGPA
            const validSGPAs = studentData.sgpa.filter(s => typeof s === 'number' && !isNaN(s));
            const topSGPA = validSGPAs.length > 0 ? Math.max(...validSGPAs).toFixed(2) : 0;
            
            document.getElementById('classTopSGPA').textContent = topSGPA;
            
            // Count at-risk students (with 2+ sub fails)
            const atRiskCount = studentData.failCount.filter(f => f >= 2).length;
            
            document.getElementById('atRiskCount').textContent = atRiskCount;
        }
        
function initializeComparisonTools() {
    const compareSubject1 = document.getElementById('compareSubject1');
    const compareSubject2 = document.getElementById('compareSubject2');
    const progressStudent = document.getElementById('progressStudent');
    const improvementSubject = document.getElementById('improvementSubject');
    
    // Clear existing options
    if (compareSubject1) compareSubject1.innerHTML = '<option value="">-- Select Subject --</option>';
    if (compareSubject2) compareSubject2.innerHTML = '<option value="">-- Select Subject --</option>';
    if (improvementSubject) improvementSubject.innerHTML = '<option value="all">All Subjects</option>';
    if (progressStudent) progressStudent.innerHTML = '<option value="">-- Select USN --</option>';
    
    // Add subject options
    if (subjectCodes && subjectCodes.length > 0) {
        subjectCodes.forEach(code => {
            if (compareSubject1) {
                const option1 = document.createElement('option');
                option1.value = code;
                option1.textContent = code;
                compareSubject1.appendChild(option1);
            }
            
            if (compareSubject2) {
                const option2 = document.createElement('option');
                option2.value = code;
                option2.textContent = code;
                compareSubject2.appendChild(option2);
            }
            
            if (improvementSubject) {
                const option3 = document.createElement('option');
                option3.value = code;
                option3.textContent = code;
                improvementSubject.appendChild(option3);
            }
        });
    }
    
    // Add student options
    if (studentData && studentData.usn) {
        studentData.usn.forEach(usn => {
            if (progressStudent) {
                const option = document.createElement('option');
                option.value = usn;
                option.textContent = usn;
                progressStudent.appendChild(option);
            }
        });
    }
}

function compareSubjects() {
    const subject1 = document.getElementById('compareSubject1').value;
    const subject2 = document.getElementById('compareSubject2').value;
    
    if (!subject1 || !subject2 || !studentData) {
        showToast('Please select two subjects to compare', 3000);
        return;
    }
    
    const subjectData1 = studentData.subjects[subject1] || [];
    const subjectData2 = studentData.subjects[subject2] || [];
    
    // Calculate statistics for both subjects
    const stats1 = calculateSubjectStatistics(subject1, subjectData1);
    const stats2 = calculateSubjectStatistics(subject2, subjectData2);
    
    // Update UI statistics
    updateComparisonStats(subject1, subject2, stats1, stats2);
    
    // Generate simplified line chart
    generateSimplifiedComparisonChart(subject1, subject2, stats1, stats2);
}

function calculateSubjectStatistics(subjectName, marks) {
    const validMarks = marks.filter(m => typeof m === 'number');
    const passCount = validMarks.filter(m => m >= 35).length;
    const totalCount = marks.length;
    
    return {
        passCount,
        totalCount,
        passRate: totalCount > 0 ? ((passCount / totalCount) * 100).toFixed(1) : 0,
        average: validMarks.length > 0 ? (validMarks.reduce((a, b) => a + b, 0) / validMarks.length).toFixed(2) : 0,
        median: calculateMedian(validMarks),
        max: validMarks.length > 0 ? Math.max(...validMarks) : 0,
        min: validMarks.length > 0 ? Math.min(...validMarks) : 0,
        validMarks
    };
}

function calculateMedian(sortedArray) {
    if (sortedArray.length === 0) return 0;
    const sorted = [...sortedArray].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
        ? ((sorted[mid - 1] + sorted[mid]) / 2).toFixed(1)
        : sorted[mid];
}

function generateSimplifiedComparisonChart(subject1, subject2, stats1, stats2) {
    const ctx = document.getElementById('subjectComparisonChart').getContext('2d');
    
    // Destroy existing chart
    if (window.subjectComparisonChartInstance) {
        try {
            window.subjectComparisonChartInstance.destroy();
        } catch (e) {
            console.error("Error destroying chart:", e);
        }
    }
    
    // Create score ranges for comparison
    const scoreRanges = ['0-20', '21-35', '36-50', '51-65', '66-80', '81-100'];
    const dist1 = calculateScoreDistribution(stats1.validMarks, scoreRanges);
    const dist2 = calculateScoreDistribution(stats2.validMarks, scoreRanges);
    
    const isMobile = window.innerWidth < 480;
    
    try {
        window.subjectComparisonChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: scoreRanges,
                datasets: [{
                    label: subject1,
                    data: dist1,
                    borderColor: '#4CC9F0',
                    backgroundColor: 'rgba(76, 201, 240, 0.1)',
                    borderWidth: isMobile ? 2 : 3,
                    pointRadius: isMobile ? 4 : 6,
                    pointBackgroundColor: '#4CC9F0',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    tension: 0.4,
                    fill: true
                }, {
                    label: subject2,
                    data: dist2,
                    borderColor: '#F72585',
                    backgroundColor: 'rgba(247, 37, 133, 0.1)',
                    borderWidth: isMobile ? 2 : 3,
                    pointRadius: isMobile ? 4 : 6,
                    pointBackgroundColor: '#F72585',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `${subject1} vs ${subject2} - Score Distribution`,
                        color: '#1E88E5',
                        font: {
                            size: isMobile ? 14 : 18,
                            weight: 'bold'
                        },
                        padding: {
                            top: 10,
                            bottom: isMobile ? 15 : 20
                        }
                    },
                    legend: {
                        position: isMobile ? 'bottom' : 'top',
                        labels: {
                            color: '#1E88E5',
                            font: {
                                size: isMobile ? 11 : 14,
                                weight: 'bold'
                            },
                            padding: isMobile ? 15 : 20,
                            boxWidth: isMobile ? 15 : 25,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#4CC9F0',
                        borderWidth: 1,
                        titleFont: {
                            size: isMobile ? 12 : 14
                        },
                        bodyFont: {
                            size: isMobile ? 11 : 13
                        },
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y} students`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Score Ranges',
                            color: '#1E88E5',
                            font: {
                                size: isMobile ? 11 : 14,
                                weight: 'bold'
                            }
                        },
                        ticks: {
                            color: '#1E88E5',
                            font: {
                                size: isMobile ? 9 : 12
                            },
                            maxRotation: isMobile ? 45 : 0
                        },
                        grid: {
                            color: 'rgba(30, 136, 229, 0.1)',
                            lineWidth: 1
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Students',
                            color: '#1E88E5',
                            font: {
                                size: isMobile ? 11 : 14,
                                weight: 'bold'
                            }
                        },
                        ticks: {
                            color: '#1E88E5',
                            font: {
                                size: isMobile ? 9 : 12
                            },
                            stepSize: 1
                        },
                        grid: {
                            color: 'rgba(30, 136, 229, 0.1)',
                            lineWidth: 1
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                elements: {
                    point: {
                        hoverRadius: isMobile ? 6 : 8
                    }
                }
            }
        });
    } catch (error) {
        console.error("Error creating comparison chart:", error);
        showToast(`Error creating chart: ${error.message}`, 5000);
    }
}

function calculateScoreDistribution(marks, ranges) {
    const distribution = Array(ranges.length).fill(0);
    
    marks.forEach(mark => {
        if (mark >= 0 && mark <= 20) distribution[0]++;
        else if (mark >= 21 && mark <= 35) distribution[1]++;
        else if (mark >= 36 && mark <= 50) distribution[2]++;
        else if (mark >= 51 && mark <= 65) distribution[3]++;
        else if (mark >= 66 && mark <= 80) distribution[4]++;
        else if (mark >= 81 && mark <= 100) distribution[5]++;
    });
    
    return distribution;
}

function updateComparisonStats(subject1, subject2, stats1, stats2) {
    document.getElementById('subject1Name').textContent = subject1;
    document.getElementById('subject2Name').textContent = subject2;
    
    document.getElementById('subject1PassRate').textContent = stats1.passRate + '%';
    document.getElementById('subject2PassRate').textContent = stats2.passRate + '%';
    
    document.getElementById('subject1Average').textContent = stats1.average;
    document.getElementById('subject2Average').textContent = stats2.average;
    
    document.getElementById('subject1Median').textContent = stats1.median;
    document.getElementById('subject2Median').textContent = stats2.median;
}

function calculateCorrelation(array1, array2) {
            if (!array1 || !array2 || array1.length !== array2.length) {
                return 0;
            }
            
            // Filter values where both have numeric data
            const pairs = [];
            for (let i = 0; i < array1.length; i++) {
                if (typeof array1[i] === 'number' && typeof array2[i] === 'number') {
                    pairs.push([array1[i], array2[i]]);
                }
            }
            
            const n = pairs.length;
            if (n < 5) return 0; // Not enough data points
            
            // Calculate means
            const mean1 = pairs.reduce((sum, pair) => sum + pair[0], 0) / n;
            const mean2 = pairs.reduce((sum, pair) => sum + pair[1], 0) / n;
            
            // Calculate covariance and variances
            let covariance = 0;
            let variance1 = 0;
            let variance2 = 0;
            
            for (let i = 0; i < n; i++) {
                const diff1 = pairs[i][0] - mean1;
                const diff2 = pairs[i][1] - mean2;
                
                covariance += diff1 * diff2;
                variance1 += diff1 * diff1;
                variance2 += diff2 * diff2;
            }
            
            if (variance1 === 0 || variance2 === 0) return 0;
            
            return covariance / Math.sqrt(variance1 * variance2);
        }
        
        // Generate insights from correlation data
        function generateCorrelationInsights(correlations, subjects) {
            const insights = [];
            const threshold = 0.7; // Strong correlation threshold
            const weakThreshold = 0.3; // Weak correlation threshold
            
            // Find strongest positive correlations
            let strongestPositive = { subjects: [], value: 0 };
            let strongestNegative = { subjects: [], value: 0 };
            
            for (let i = 0; i < subjects.length; i++) {
                for (let j = i + 1; j < subjects.length; j++) {
                    const subjectA = subjects[i];
                    const subjectB = subjects[j];
                    const value = correlations[subjectA][subjectB];
                    
                    if (value > strongestPositive.value) {
                        strongestPositive = { subjects: [subjectA, subjectB], value };
                    }
                    
                    if (value < strongestNegative.value) {
                        strongestNegative = { subjects: [subjectA, subjectB], value };
                    }
                    
                    if (value > threshold) {
                        insights.push(`Strong positive correlation (${value.toFixed(2)}) between ${subjectA} and ${subjectB}.`);
                    } else if (value < -threshold) {
                        insights.push(`Strong negative correlation (${value.toFixed(2)}) between ${subjectA} and ${subjectB}.`);
                    }
                }
            }
            
            if (strongestPositive.value > weakThreshold) {
                insights.unshift(`Strongest positive correlation (${strongestPositive.value.toFixed(2)}) is between ${strongestPositive.subjects[0]} and ${strongestPositive.subjects[1]}.`);
            }
            
            if (strongestNegative.value < -weakThreshold) {
                insights.unshift(`Strongest negative correlation (${strongestNegative.value.toFixed(2)}) is between ${strongestNegative.subjects[0]} and ${strongestNegative.subjects[1]}.`);
            }
            
            if (insights.length === 0) {
                insights.push('No significant correlations found between subjects.');
            }
            
            return insights;
        }
        
        // Calculate improvement metrics for a student
        function calculateImprovementMetrics() {
            const studentUsn = document.getElementById('progressStudent').value;
            const focusSubject = document.getElementById('improvementSubject').value;
            
            if (!studentUsn || !studentData) {
                showToast('Please select a student to analyze', 3000);
                return;
            }
            
            const studentIndex = studentData.usn.indexOf(studentUsn);
            if (studentIndex === -1) {
                showToast('Selected student not found in data', 3000);
                return;
            }
            
            // Get current student data
            const currentSGPA = studentData.sgpa[studentIndex];
            const currentGrade = studentData.grade[studentIndex];
            const failCount = studentData.failCount[studentIndex] || 0;
            
            // Display current metrics
            document.getElementById('currentSGPA').textContent = currentSGPA.toFixed(2);
            
            // Calculate potential improvement
            let requiredImprovement = 0;
            let potentialSGPA = currentSGPA;
            let gradeImprovement = 'None';
            
            if (focusSubject === 'all') {
                // Calculate improvement if all failing subjects were passed
                if (failCount > 0) {
                    // Estimate SGPA improvement (roughly 0.3-0.5 per subject passed)
                    requiredImprovement = failCount;
                    potentialSGPA = Math.min(10, currentSGPA + (failCount * 0.4));
                    
                    // Estimate grade improvement
                    if (currentGrade === 'F' && potentialSGPA >= 4) {
                        gradeImprovement = 'F → P';
                    } else if (currentGrade === 'P' && potentialSGPA >= 5) {
                        gradeImprovement = 'P → SC';
                    } else if (currentGrade === 'SC' && potentialSGPA >= 6) {
                        gradeImprovement = 'SC → FC';
                    } else if (currentGrade === 'FC' && potentialSGPA >= 7.5) {
                        gradeImprovement = 'FC → FCD';
                    } else {
                        gradeImprovement = 'No grade change';
                    }
                } else {
                    // No failing subjects, estimate improvement from score increase
                    const avgMark = studentData.percentage[studentIndex];
                    if (avgMark < 90) {
                        requiredImprovement = ((90 - avgMark) / 10).toFixed(1) + ' in each subject';
                        potentialSGPA = Math.min(10, currentSGPA + 0.5);
                        
                        if (currentGrade === 'FC' && potentialSGPA >= 7.5) {
                            gradeImprovement = 'FC → FCD';
                        } else {
                            gradeImprovement = 'SGPA increase only';
                        }
                    }
                }
            } else {
                // Focus on specific subject
                const subjectMark = studentData.subjects[focusSubject][studentIndex];
                
                if (typeof subjectMark === 'number') {
                    if (subjectMark < 40) {
                        // Failed subject
                        requiredImprovement = (40 - subjectMark) + ' marks';
                        potentialSGPA = Math.min(10, currentSGPA + 0.4); // Rough estimate for passing one subject
                        
                        if (failCount === 1 && currentGrade === 'F') {
                            gradeImprovement = 'F → P';
                        } else {
                            gradeImprovement = 'SGPA increase only';
                        }
                    } else {
                        // Already passing, estimate improvement
                        const potentialMark = Math.min(100, subjectMark + 20);
                        requiredImprovement = '20 marks';
                        potentialSGPA = Math.min(10, currentSGPA + 0.2); // Rough estimate for improving one subject
                        gradeImprovement = 'Marginal SGPA increase';
                    }
                } else {
                    requiredImprovement = 'Subject data unavailable';
                    gradeImprovement = 'Cannot calculate';
                }
            }
            
            // Update UI
            document.getElementById('requiredImprovement').textContent = requiredImprovement;
            document.getElementById('potentialSGPA').textContent = potentialSGPA.toFixed(2);
            document.getElementById('gradeImprovement').textContent = gradeImprovement;
            
            // Generate improvement plan
            generateImprovementPlan(studentUsn, studentIndex, focusSubject, failCount);
        }
        
        // Generate a personalized improvement plan
        function generateImprovementPlan(usn, studentIndex, focusSubject, failCount) {
            let planHtml = '';
            
            if (failCount > 0) {
                planHtml += `<h5 style="margin-top: 0; margin-bottom: 10px; color: var(--text-color);">Priority Focus Areas for ${usn}</h5>`;
                
                if (focusSubject === 'all') {
                    // Create list of failed subjects
                    const failedSubjects = [];
                    
                    subjectCodes.forEach(code => {
                        const mark = studentData.subjects[code][studentIndex];
                        if (typeof mark === 'number' && mark < 40) {
                            failedSubjects.push({ code, mark });
                        }
                    });
                    
                    // Sort by closest to passing first
                    failedSubjects.sort((a, b) => b.mark - a.mark);
                    
                    planHtml += '<ol style="margin-left: 20px; margin-bottom: 15px;">';
                    failedSubjects.forEach(subject => {
                        const gap = 40 - subject.mark;
                        planHtml += `<li style="margin-bottom: 8px;"><strong>${subject.code}</strong>: Currently at ${subject.mark}/100, needs ${gap} more marks to pass</li>`;
                    });
                    planHtml += '</ol>';
                    
                    planHtml += '<p style="margin-bottom: 10px;"><strong>Recommendation:</strong> Focus on subjects where you\'re closest to passing first.</p>';
                    
                } else {
                    // Focus on specific subject
                    const subjectMark = studentData.subjects[focusSubject][studentIndex];
                    
                    if (typeof subjectMark === 'number') {
                        if (subjectMark < 40) {
                            const gap = 40 - subjectMark;
                            planHtml += `<p style="margin-bottom: 10px;">You need ${gap} more marks in ${focusSubject} to pass this subject.</p>`;
                            planHtml += `<p style="margin-bottom: 10px;">Current mark: ${subjectMark}/100 (${Math.round(subjectMark)}%)</p>`;
                        } else {
                            planHtml += `<p style="margin-bottom: 10px;">You're already passing ${focusSubject} with ${subjectMark}/100 marks.</p>`;
                            planHtml += `<p style="margin-bottom: 10px;">To improve further, aim for a 10-15% increase in your scores.</p>`;
                        }
                    }
                }
            } else {
                // No fails, focus on improvement
                planHtml += `<h5 style="margin-top: 0; margin-bottom: 10px; color: var(--text-color);">Performance Enhancement for ${usn}</h5>`;
                
                // Find lowest scoring subjects
                const subjectScores = [];
                
                subjectCodes.forEach(code => {
                    const mark = studentData.subjects[code][studentIndex];
                    if (typeof mark === 'number') {
                        subjectScores.push({ code, mark });
                    }
                });
                
                // Sort by lowest first
                subjectScores.sort((a, b) => a.mark - b.mark);
                
                planHtml += '<p style="margin-bottom: 10px;"><strong>Focus on your lowest scoring subjects:</strong></p>';
                planHtml += '<ul style="margin-left: 20px; margin-bottom: 15px;">';
                
                for (let i = 0; i < Math.min(3, subjectScores.length); i++) {
                    planHtml += `<li style="margin-bottom: 8px;"><strong>${subjectScores[i].code}</strong>: Currently at ${subjectScores[i].mark}/100</li>`;
                }
                
                planHtml += '</ul>';
                
                planHtml += '<p style="margin-bottom: 10px;">Even with no failed subjects, improving these lowest scores will have the greatest impact on your overall SGPA.</p>';
            }
            
            document.getElementById('improvementPlan').innerHTML = planHtml;
        }
document.getElementById('excelUpload').addEventListener('change', function (e) {
const file = e.target.files[0];
if (!file) return;

document.getElementById('loadingSpinner').classList.add('active');
const reader = new FileReader();

reader.onload = function (event) {
try {
const data = new Uint8Array(event.target.result);
const workbook = XLSX.read(data, { type: 'array' });
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
const processedData = processExcelData(rows);
loadJsonFile(processedData);
const fileName = document.querySelector('.file-name');
if (fileName) {
fileName.textContent = file.name;
}

} catch (error) {
console.error("Error processing Excel file:", error);
showToast('Error processing Excel file: ' + error.message, 5000);
} finally {
document.getElementById('loadingSpinner').classList.remove('active');
}
};

reader.onerror = function() {
document.getElementById('loadingSpinner').classList.remove('active');
showToast('Error reading file', 3000);
};

reader.readAsArrayBuffer(file);
});
document.getElementById('excelUpload').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) {
        console.log("No file selected");
        return;
    }

    console.log("File selected:", file.name);
    document.getElementById('loadingSpinner').classList.add('active');
    const reader = new FileReader();
    
    reader.onload = function (event) {
        try {
            console.log("Starting file processing...");
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Log available sheets
            console.log("Available sheets:", workbook.SheetNames);
            
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            console.log("Processing sheet:", workbook.SheetNames[0]);
            
            // Get the raw data with more options for debugging
            const rows = XLSX.utils.sheet_to_json(sheet, {
                header: 1,
                defval: "",
                blankrows: false,
                raw: true
            });

            console.log("Raw Excel data (first few rows):", rows.slice(0, 3));

            // Dynamically process the data
            const processedData = processExcelDataDynamic(rows);

            console.log("Processed data:", processedData);

            if (processedData.length === 0) {
                throw new Error("No valid data rows found after processing");
            }

            // Update UI
            loadJsonFile(processedData);
            const fileName = document.querySelector('.file-name');
            if (fileName) fileName.textContent = file.name;

            console.log("Data processing completed successfully");
            showToast('File processed successfully', 3000);

        } catch (error) {
            console.error("Detailed error:", error);
            console.error("Error stack:", error.stack);
            showToast('Error processing file: ' + error.message, 5000);
        } finally {
            document.getElementById('loadingSpinner').classList.remove('active');
        }
    };

    reader.onerror = function(error) {
        console.error("FileReader error:", error);
        document.getElementById('loadingSpinner').classList.remove('active');
        showToast('Error reading file', 3000);
    };

    reader.readAsArrayBuffer(file);
});

function processExcelDataDynamic(rows) {
    if (!rows || rows.length < 3) {
        throw new Error("Invalid Excel data format - need at least 3 rows");
    }

    const headerRow1 = rows[0];
    const headerRow2 = rows[1];
    const dataRows = rows.slice(2);

    console.log("Header Row 1:", headerRow1);
    console.log("Header Row 2:", headerRow2);

    // Find the "Final" column index
    const finalIndex = headerRow1.findIndex(cell => 
        cell && (cell.toString().toLowerCase().includes('final') || 
                 cell.toString().toLowerCase().includes('total'))
    );
    
    if (finalIndex === -1) {
        throw new Error("Could not find 'Final' or 'Total' column in header");
    }

    console.log("Final column index:", finalIndex);

    // Extract subject codes - everything between USN (index 0) and Final column
    const subjectCodes = [];
    const subjectColumnMap = {};
    
    for (let i = 1; i < finalIndex; i++) {
        const subjectCode = headerRow1[i];
        if (subjectCode && subjectCode.toString().trim() !== "") {
            const cleanCode = subjectCode.toString().trim();
            subjectCodes.push(cleanCode);
            
            // Find the "Total" column for this subject in row 2
            let totalColumnIndex = -1;
            for (let j = i; j < finalIndex; j++) {
                const headerCell = headerRow2[j];
                if (headerCell && headerCell.toString().toLowerCase().includes('total')) {
                    totalColumnIndex = j;
                    break;
                }
            }
            
            // If no "Total" found, use the current column
            subjectColumnMap[cleanCode] = totalColumnIndex !== -1 ? totalColumnIndex : i;
        }
    }

    console.log("Extracted subject codes:", subjectCodes);
    console.log("Subject column mapping:", subjectColumnMap);

    // Map final section columns (everything after Final column)
    const finalColumns = {};
    for (let i = finalIndex; i < headerRow1.length; i++) {
        const header = headerRow2[i]?.toString().toLowerCase().trim();
        if (header) {
            if (header.includes("total")) finalColumns["Total"] = i;
            else if (header.includes("percentage") || header.includes("%")) finalColumns["%"] = i;
            else if (header.includes("sgpa") || header.includes("cgpa")) finalColumns["Sgpa"] = i;
            else if (header.includes("grade")) finalColumns["Grade"] = i;
            else if (header.includes("fail")) finalColumns["Fail count"] = i;
        }
    }

    console.log("Final section columns:", finalColumns);

    // Process each data row
    return dataRows
        .filter(row => {
            if (!row || !row.length || !row[0]) return false;
            const usn = String(row[0]).trim();
            return usn && usn.length > 5 && !usn.includes("SRAC") && !usn.includes("Total");
        })
        .map(row => {
            // Start with USN
            const studentData = {
                "USN": String(row[0]).trim()
            };

            // Add all subject codes with their marks
            subjectCodes.forEach(code => {
                const columnIndex = subjectColumnMap[code];
                if (columnIndex !== undefined && row[columnIndex] !== undefined) {
                    const markValue = row[columnIndex];
                    
                    // Handle different mark formats
                    if (typeof markValue === 'string' && markValue.includes('F_')) {
                        studentData[code] = markValue; // Keep F_ format as is
                    } else {
                        const numericMark = parseFloat(markValue);
                        studentData[code] = !isNaN(numericMark) ? numericMark : 0;
                    }
                } else {
                    studentData[code] = 0; // Default value if column not found
                }
            });

            // Add final section data
            studentData["Total"] = finalColumns["Total"] !== undefined ? 
                (parseFloat(row[finalColumns["Total"]]) || 0) : 0;
            
            studentData["%"] = finalColumns["%"] !== undefined ? 
                (parseFloat(row[finalColumns["%"]]) || 0) : 0;
            
            studentData["Sgpa"] = finalColumns["Sgpa"] !== undefined ? 
                (parseFloat(row[finalColumns["Sgpa"]]) || 0) : 0;
            
            studentData["Grade"] = finalColumns["Grade"] !== undefined ? 
                (String(row[finalColumns["Grade"]] || "").trim()) : "";
            
            studentData["Fail count"] = finalColumns["Fail count"] !== undefined ? 
                (row[finalColumns["Fail count"]] !== undefined ? parseInt(row[finalColumns["Fail count"]]) : null) : null;

            console.log(`Processing student ${studentData.USN}:`, studentData);
            return studentData;
        });
}

function parseMarkTotal(ia, ea, total) {
    // If total is directly provided and valid
    if (total !== undefined && total !== "") {
        if (typeof total === 'string' && total.includes('F_')) {
            return total; // Return F_ format as is
        }
        const numTotal = parseFloat(total);
        if (!isNaN(numTotal)) return numTotal;
    }

    // Calculate from IA and EA if needed
    const iaNum = parseFloat(ia) || 0;
    const eaNum = parseFloat(ea) || 0;
    return iaNum + eaNum;
}

function loadJsonFile(data) {
    document.getElementById('loadingSpinner').classList.add('active');
    showToast('Processing uploaded data...', 3000);
    
    try {
        processJsonData(data);
        showToast('Successfully processed uploaded data', 3000);
    } catch (error) {
        console.error("Error processing data:", error);
        showToast('Error processing data: ' + error.message, 5000);
    } finally {
        document.getElementById('loadingSpinner').classList.remove('active');
    }
}

function parseMarkTotal(ia, ea, total) {
    // If total is directly provided and valid
    if (total !== undefined && total !== "") {
        if (typeof total === 'string' && total.includes('F_')) {
            return total; // Return F_ format as is
        }
        const numTotal = parseFloat(total);
        if (!isNaN(numTotal)) return numTotal;
    }

    // Calculate from IA and EA if needed
    const iaNum = parseFloat(ia) || 0;
    const eaNum = parseFloat(ea) || 0;
    return iaNum + eaNum;
}

// Add this helper function to check data structure
function logDataStructure(data) {
    console.log("Data Structure Analysis:");
    console.log("Total records:", data.length);
    if (data.length > 0) {
        console.log("First record structure:", {
            keys: Object.keys(data[0]),
            types: Object.entries(data[0]).map(([key, value]) => 
                `${key}: ${typeof value}${value === null ? ' (null)' : ''}`
            )
        });
    }
}
function processExcelData(rows) {
    if (!rows || rows.length < 3) {
        throw new Error("Invalid Excel data format");
    }

    const headerRow1 = rows[0];
    const headerRow2 = rows[1];
    const dataRows = rows.slice(2);
    const finalIndex = headerRow1.findIndex(cell => cell === "Final");
    if (finalIndex === -1) {
        throw new Error("Could not find 'Final' column");
    }

    const subjectCodes = headerRow1.slice(1, finalIndex).filter(code => code !== "");
    const columnMap = {};
    let currentSubject = null;
    headerRow1.forEach((cell, index) => {
        if (cell && cell !== "Final") {
            currentSubject = cell;
        }
        if (currentSubject && headerRow2[index]?.toString().toLowerCase().trim() === "total") {
            columnMap[currentSubject] = index;
        }
    });
    const finalColumns = {};
    for (let i = finalIndex; i < headerRow1.length; i++) {
        const header = headerRow2[i]?.toString().toLowerCase().trim();
        if (header.includes("total")) finalColumns["Total"] = i;
        if (header.includes("percentage")) finalColumns["%"] = i;
        if (header.includes("cgpa")) finalColumns["Sgpa"] = i;
        if (header.includes("grade")) finalColumns["Grade"] = i;
        if (header.includes("fail")) finalColumns["Fail count"] = i;
    }

    return dataRows.map(row => {
        const usn = row[0]?.toString().trim();
        if (!usn || usn.length < 10 || !usn.startsWith("1")) return null;

        const obj = { USN: usn };
        subjectCodes.forEach(subject => {
            const totalIndex = columnMap[subject];
            obj[subject] = parseFloat(row[totalIndex]) || 0;
        });
        obj["Total"] = parseFloat(row[finalColumns["Total"]]) || 0;
        obj["%"] = parseFloat(row[finalColumns["%"]]) || 0;
        obj["Sgpa"] = parseFloat(row[finalColumns["Sgpa"]]) || 0;
        obj["Grade"] = row[finalColumns["Grade"]]?.toString() || "";
        obj["Fail count"] = row[finalColumns["Fail count"]] || null;

        return obj;
    }).filter(Boolean); // Remove null entries
}

function loadJsonFile(data) {
    document.getElementById('loadingSpinner').classList.add('active');
    showToast('Processing uploaded data...', 3000);
    
    try {
        processJsonData(data);
        showToast('Successfully processed uploaded data', 3000);
    } catch (error) {
        console.error("Error processing data:", error);
        showToast('Error processing data: ' + error.message, 5000);
    } finally {
        document.getElementById('loadingSpinner').classList.remove('active');
    }
}
        function initializeAnalyticsComponents() {
            updateDashboardStats();
            initializeComparisonTools();
            
            // Initialize section states
            const sections = ['subjectComparisonContent', 'studentChartContent', 'subjectChartContent'];
            sections.forEach(sectionId => {
                const element = document.getElementById(sectionId);
                if (element) {
                    element.classList.add('collapsed');
                    element.classList.remove('expanded');
                    
                    const toggleId = sectionId.replace('Content', 'Toggle');
                    const toggle = document.getElementById(toggleId);
                    if (toggle) {
                        toggle.classList.add('collapsed');
                    }
                }
            });
        }
        
        const originalProcessJsonData = processJsonData;
        processJsonData = function(data) {
            originalProcessJsonData(data);
            initializeAnalyticsComponents();
        };
        
        if (studentData) {
            initializeAnalyticsComponents();
        }

document.addEventListener('DOMContentLoaded', () => {
    document.body.style.zoom = '0.95';
    
    // Handle window resize for responsive charts
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            // Re-render charts if they exist and data is available
            if (studentData && subjectCodes.length > 0) {
                const studentSelect = document.getElementById('studentSelect');
                const subjectSelect = document.getElementById('subjectSelect');
                
                // Re-render student comparison chart if a student is selected
                if (studentSelect.value && studentComparisonChartInstance) {
                    generateStudentComparisonChart(studentSelect.value);
                }
                
                // Re-render subject analysis chart if a subject is selected
                if (subjectSelect.value && subjectAnalysisChartInstance) {
                    generateSubjectAnalysisChart(subjectSelect.value);
                }
                
                // Re-render any modal charts if modal is open
                if (modalChart && document.getElementById('chartModal').style.display !== 'none') {
                    refreshModalChart();
                }
            }
        }, 300); // Debounce resize events
    });
});

// Download functionality
function downloadSRAC() {
    window.location.href = 'TC.html';
}

// Add download button event listeners
document.addEventListener('DOMContentLoaded', function() {
    const downloadButtons = document.querySelectorAll('.btn-download, .btn-download-stellar, .btn-download-cosmic, .btn-download-modern');
    downloadButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            downloadSRAC();
        });
    });
});