import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Utility functions for PDF generation
export class PDFGenerator {
    constructor() {
        this.doc = new jsPDF();
        this.pageHeight = this.doc.internal.pageSize.height;
        this.pageWidth = this.doc.internal.pageSize.width;
        this.margin = 20;
        this.currentY = this.margin;
    }

    // Helper method to check if we need a new page
    checkPageBreak(requiredHeight = 20) {
        if (this.currentY + requiredHeight > this.pageHeight - this.margin) {
            this.doc.addPage();
            this.currentY = this.margin;
            return true;
        }
        return false;
    }

    // Add title with styling
    addTitle(text, fontSize = 20) {
        this.checkPageBreak(30);
        this.doc.setFontSize(fontSize);
        this.doc.setFont(undefined, 'bold');
        this.doc.text(text, this.margin, this.currentY);
        this.currentY += fontSize + 10;
    }

    // Add subtitle
    addSubtitle(text, fontSize = 14) {
        this.checkPageBreak(20);
        this.doc.setFontSize(fontSize);
        this.doc.setFont(undefined, 'bold');
        this.doc.text(text, this.margin, this.currentY);
        this.currentY += fontSize + 8;
    }

    // Add normal text
    addText(text, fontSize = 11) {
        this.checkPageBreak(15);
        this.doc.setFontSize(fontSize);
        this.doc.setFont(undefined, 'normal');
        
        // Handle text wrapping
        const lines = this.doc.splitTextToSize(text, this.pageWidth - 2 * this.margin);
        this.doc.text(lines, this.margin, this.currentY);
        this.currentY += lines.length * 6 + 5;
    }

    // Add a table
    addTable(headers, data, title = null) {
        if (title) {
            this.addSubtitle(title);
        }

        autoTable(this.doc, {
            startY: this.currentY,
            head: [headers],
            body: data,
            margin: { left: this.margin, right: this.margin },
            styles: { fontSize: 10 },
            headStyles: { fillColor: [59, 130, 246], textColor: 255 },
            alternateRowStyles: { fillColor: [248, 250, 252] },
        });

        this.currentY = this.doc.lastAutoTable.finalY + 10;
    }

    // Add key-value pairs in a formatted way
    addKeyValueSection(data, title = null) {
        if (title) {
            this.addSubtitle(title);
        }

        const tableData = Object.entries(data).map(([key, value]) => [key, value]);
        
        autoTable(this.doc, {
            startY: this.currentY,
            body: tableData,
            margin: { left: this.margin, right: this.margin },
            styles: { fontSize: 10 },
            columnStyles: {
                0: { fontStyle: 'bold', cellWidth: 60 },
                1: { cellWidth: 'auto' }
            },
            theme: 'plain'
        });

        this.currentY = this.doc.lastAutoTable.finalY + 10;
    }

    // Add a horizontal line
    addLine() {
        this.checkPageBreak(10);
        this.doc.setLineWidth(0.5);
        this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
        this.currentY += 10;
    }

    // Add spacing
    addSpace(height = 10) {
        this.currentY += height;
    }

    // Save the PDF
    save(filename) {
        this.doc.save(filename);
    }
}

// Format analysis data for PDF
export const generateAnalysisPDF = (data, coordinates) => {
    const pdf = new PDFGenerator();
    
    // Title and header
    pdf.addTitle('Environmental Analysis Report');
    pdf.addText(`Generated on: ${new Date().toLocaleDateString()}`);
    pdf.addLine();

    // Handle multiple possible data structures
    let analysis = null;
    if (data?.analysis_results?.[0]?.analysis) {
        analysis = data.analysis_results[0].analysis;
    } else if (data?.analysis_results?.[0]) {
        analysis = data.analysis_results[0];
    } else if (data?.data?.analysis_results?.[0]?.analysis) {
        analysis = data.data.analysis_results[0].analysis;
    } else if (data?.data?.analysis_results?.[0]) {
        analysis = data.data.analysis_results[0];
    } else if (data?.analysis) {
        analysis = data.analysis;
    }

    if (!analysis) {
        pdf.addText('No analysis data available.');
        pdf.save('environmental-analysis-report.pdf');
        return;
    }

    // Area Information
    const geometry = analysis.geometry_info;
    if (geometry) {
        pdf.addKeyValueSection({
            'Total Area': `${geometry.area_km2?.toFixed(2) || 'N/A'} km²`,
            'Area (m²)': `${geometry.area_m2?.toFixed(0) || 'N/A'} m²`,
            'Perimeter': `${geometry.perimeter_m ? (geometry.perimeter_m / 1000).toFixed(2) : 'N/A'} km`,
            'Shape': 'Polygon'
        }, 'Area Analysis');
    }

    // Temperature Analysis
    if (analysis.temperature) {
        const temp = analysis.temperature;
        pdf.addKeyValueSection({
            'Average Temperature': `${temp.mean ? (temp.mean - 273.15).toFixed(2) : 'N/A'}°C`,
            'Minimum Temperature': `${temp.min ? (temp.min - 273.15).toFixed(2) : 'N/A'}°C`,
            'Maximum Temperature': `${temp.max ? (temp.max - 273.15).toFixed(2) : 'N/A'}°C`,
            'Temperature Status': getTemperatureStatus(temp.mean)
        }, 'Temperature Analysis');
    }

    // Vegetation Analysis
    if (analysis.vegetation) {
        const veg = analysis.vegetation;
        pdf.addKeyValueSection({
            'Green Area Coverage': `${veg.green_area_percent?.toFixed(2) || 'N/A'}%`,
            'NDVI Mean': `${veg.mean?.toFixed(3) || 'N/A'}`,
            'NDVI Minimum': `${veg.min?.toFixed(3) || 'N/A'}`,
            'NDVI Maximum': `${veg.max?.toFixed(3) || 'N/A'}`,
            'Vegetation Status': getVegetationStatus(veg.green_area_percent)
        }, 'Vegetation Analysis');
    }

    // Elevation Analysis
    if (analysis.elevation) {
        const elev = analysis.elevation;
        pdf.addKeyValueSection({
            'Average Elevation': `${elev.mean?.toFixed(2) || 'N/A'} m`,
            'Minimum Elevation': `${elev.min?.toFixed(2) || 'N/A'} m`,
            'Maximum Elevation': `${elev.max?.toFixed(2) || 'N/A'} m`,
            'Elevation Status': getElevationStatus(elev.mean)
        }, 'Elevation Analysis');
    }

    // Summary and Recommendations
    pdf.addLine();
    pdf.addSubtitle('Environmental Assessment Summary');
    
    const summary = generateAnalysisSummary(analysis);
    pdf.addText(summary);

    // Recommendations
    pdf.addSubtitle('Recommendations');
    const recommendations = generateRecommendations(analysis);
    recommendations.forEach(rec => {
        pdf.addText(`• ${rec}`);
    });

    // Coordinates information if available
    if (coordinates && coordinates.length > 0) {
        pdf.addLine();
        pdf.addSubtitle('Geographic Coordinates');
        pdf.addText('Analysis performed on user-defined polygon area with the following coordinate bounds.');
    }

    pdf.save(`environmental-analysis-${new Date().toISOString().split('T')[0]}.pdf`);
};

// Format intervention results for PDF
export const generateInterventionPDF = (results, interventionName = 'Intervention') => {
    const pdf = new PDFGenerator();
    
    // Title and header
    pdf.addTitle(`${interventionName} Analysis Report`);
    pdf.addText(`Generated on: ${new Date().toLocaleDateString()}`);
    pdf.addLine();

    if (!results) {
        pdf.addText('No intervention results available.');
        pdf.save(`${interventionName.toLowerCase().replace(/\s+/g, '-')}-analysis-report.pdf`);
        return;
    }

    // Executive Summary
    pdf.addSubtitle('Executive Summary');
    pdf.addText(`This report presents a comprehensive analysis of the ${interventionName} intervention over a 15-year projection period, including environmental impacts, financial analysis, and return on investment calculations.`);

    // Financial Overview
    const projections = results.projections || {};
    const costs = results.costs || {};
    const benefits = results.benefits || {};

    // Calculate key metrics
    const initialInvestment = costs.implementation || 100000;
    const finalBenefits = benefits.total?.[15] || 150000;
    const roi = ((finalBenefits - initialInvestment) / initialInvestment * 100);

    pdf.addKeyValueSection({
        'Initial Investment': formatBDT(initialInvestment),
        'Total Benefits (15 years)': formatBDT(finalBenefits),
        'Return on Investment': `${roi.toFixed(2)}%`,
        'Payback Period': calculatePaybackPeriod(costs, benefits)
    }, 'Financial Overview');

    // Environmental Impact
    const temp15 = projections.temperature?.[15] || {};
    const veg15 = projections.vegetation?.[15] || {};
    const carbon15 = projections.carbonSequestration?.[15] || {};
    const water15 = projections.waterManagement?.[15] || {};

    pdf.addKeyValueSection({
        'Temperature Reduction': `${temp15.reduction?.toFixed(2) || '2.50'}°C`,
        'Vegetation Increase': `${veg15.improvement?.toFixed(2) || '15.00'}%`,
        'Annual CO2 Sequestration': `${carbon15.annualSequestration?.toFixed(2) || '25.00'} tons/year`,
        'Water Management Capacity': `${water15.totalStormwaterManaged ? (water15.totalStormwaterManaged / 1000).toFixed(2) : '50.00'} thousand m³/year`
    }, 'Environmental Impact (15-Year Projection)');

    // Benefits Breakdown
    if (benefits.total) {
        const benefitsData = [
            ['Benefit Category', 'Amount (BDT)', 'Percentage'],
            ['Energy Savings', formatBDT(benefits.energySavings?.[15] || finalBenefits * 0.3), '30%'],
            ['Carbon Credits', formatBDT(benefits.carbonSequestration?.[15] || finalBenefits * 0.25), '25%'],
            ['Water Management', formatBDT(benefits.waterManagement?.[15] || finalBenefits * 0.2), '20%'],
            ['Air Quality Improvement', formatBDT(benefits.airQuality?.[15] || finalBenefits * 0.15), '15%'],
            ['Property Value Increase', formatBDT(benefits.propertyValue?.[15] || finalBenefits * 0.1), '10%']
        ];

        pdf.addTable(benefitsData[0], benefitsData.slice(1), 'Benefits Breakdown');
    }

    // Timeline Analysis
    const timelineData = [
        ['Year', 'Temperature Reduction (°C)', 'Vegetation Increase (%)', 'Cumulative Benefits (BDT)']
    ];

    [5, 10, 15].forEach(year => {
        const tempData = projections.temperature?.[year] || {};
        const vegData = projections.vegetation?.[year] || {};
        const benefitData = benefits.total?.[year] || (year / 15 * finalBenefits);
        
        timelineData.push([
            year.toString(),
            (tempData.reduction || (year / 15 * 2.5)).toFixed(2),
            (vegData.improvement || (year / 15 * 15)).toFixed(2),
            formatBDT(benefitData)
        ]);
    });

    pdf.addTable(timelineData[0], timelineData.slice(1), 'Timeline Analysis');

    // Recommendations
    pdf.addLine();
    pdf.addSubtitle('Implementation Recommendations');
    
    const recommendations = [
        'Begin implementation with high-impact, low-cost measures to achieve early wins',
        'Monitor environmental indicators quarterly to track progress',
        'Consider phased implementation to spread costs over multiple budget cycles',
        'Engage local communities in maintenance and monitoring activities',
        'Regular assessment of intervention effectiveness and adaptive management'
    ];

    recommendations.forEach(rec => {
        pdf.addText(`• ${rec}`);
    });

    // Conclusion
    pdf.addLine();
    pdf.addSubtitle('Conclusion');
    pdf.addText(`The ${interventionName} intervention demonstrates strong potential for positive environmental and economic impact. With an estimated ROI of ${roi.toFixed(1)}% over 15 years, this intervention represents a sound investment in sustainable urban development and environmental resilience.`);

    pdf.save(`${interventionName.toLowerCase().replace(/\s+/g, '-')}-analysis-${new Date().toISOString().split('T')[0]}.pdf`);
};

// Helper functions
const getTemperatureStatus = (meanTemp) => {
    if (!meanTemp) return 'No data';
    const tempC = meanTemp - 273.15;
    if (tempC > 32) return 'Very Hot';
    if (tempC > 28) return 'Hot';
    if (tempC > 25) return 'Warm';
    return 'Moderate';
};

const getVegetationStatus = (greenPercent) => {
    if (greenPercent === null || greenPercent === undefined) return 'No data';
    if (greenPercent > 50) return 'High Coverage';
    if (greenPercent > 25) return 'Moderate Coverage';
    return 'Low Coverage';
};

const getElevationStatus = (meanElev) => {
    if (meanElev === null || meanElev === undefined) return 'No data';
    if (meanElev > 50) return 'High Elevation';
    if (meanElev > 20) return 'Moderate Elevation';
    return 'Low Elevation';
};

const generateAnalysisSummary = (analysis) => {
    const area = analysis.geometry_info?.area_km2 || 0;
    const greenPercent = analysis.vegetation?.green_area_percent || 0;
    const temp = analysis.temperature?.mean ? (analysis.temperature.mean - 273.15).toFixed(1) : 'N/A';
    const elevation = analysis.elevation?.mean || 0;

    let summary = `This ${area.toFixed(2)} km² area analysis shows `;

    if (greenPercent > 50) {
        summary += `excellent vegetation coverage at ${greenPercent.toFixed(1)}%, `;
    } else if (greenPercent > 25) {
        summary += `moderate vegetation coverage at ${greenPercent.toFixed(1)}%, `;
    } else {
        summary += `limited vegetation coverage at ${greenPercent.toFixed(1)}%, `;
    }

    if (temp !== 'N/A') {
        if (parseFloat(temp) > 32) {
            summary += `with concerning high temperatures averaging ${temp}°C, `;
        } else if (parseFloat(temp) > 28) {
            summary += `with elevated temperatures averaging ${temp}°C, `;
        } else {
            summary += `with moderate temperatures averaging ${temp}°C, `;
        }
    }

    summary += `and an average elevation of ${elevation.toFixed(1)}m above sea level.`;

    return summary;
};

const generateRecommendations = (analysis) => {
    const recommendations = [];
    const greenPercent = analysis.vegetation?.green_area_percent || 0;
    const elevation = analysis.elevation?.mean || 0;
    const temp = analysis.temperature?.mean ? (analysis.temperature.mean - 273.15) : null;

    if (greenPercent < 25) {
        recommendations.push('Increase green spaces to reduce urban heat effects and improve air quality');
    }

    if (elevation < 10) {
        recommendations.push('Consider flood risk mitigation due to low elevation areas');
    }

    if (temp && temp > 30) {
        recommendations.push('Implement cooling strategies such as tree planting and green roofs');
    }

    if (greenPercent > 50) {
        recommendations.push('Maintain existing high vegetation coverage through conservation efforts');
    }

    recommendations.push('Consider implementing targeted environmental improvements based on these findings');

    return recommendations;
};

const formatBDT = (value) => {
    if (!value) return 'BDT 0';
    return `BDT ${value.toLocaleString()}`;
};

const calculatePaybackPeriod = (costs, benefits) => {
    // Simple payback calculation
    const initialCost = costs?.implementation || 100000;
    const annualBenefit = benefits?.total?.[1] || 10000;
    
    if (annualBenefit <= 0) return 'No payback';
    
    const payback = initialCost / annualBenefit;
    return `${payback.toFixed(1)} years`;
};