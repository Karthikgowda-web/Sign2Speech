# Excel Import Guide

## Overview
You can now import your large Excel datasets (27,000+ data points) directly into the training system!

## Supported Formats

### Format 1: Single Sheet with Label Column (Recommended)
```
| Label | Feature1 | Feature2 | ... | Feature126 |
|-------|----------|----------|-----|------------|
| A     | 0.123    | 0.456    | ... | 0.789      |
| A     | 0.234    | 0.567    | ... | 0.890      |
| B     | 0.345    | 0.678    | ... | 0.901      |
```

**Requirements:**
- First row must be headers
- Label column can be named: `label`, `class`, `sign`, `letter`, `word`, `target`, `y`
- Or label can be in first column (if it contains text labels)
- Or label can be in last column
- 126 feature columns (will auto-pad/truncate if different)
- All feature values must be numeric

### Format 2: Multiple Sheets (One Sheet Per Class)
```
Sheet "A":
| Feature1 | Feature2 | ... | Feature126 |
|----------|----------|-----|------------|
| 0.123    | 0.456    | ... | 0.789      |
| 0.234    | 0.567    | ... | 0.890      |

Sheet "B":
| Feature1 | Feature2 | ... | Feature126 |
|----------|----------|-----|------------|
| 0.345    | 0.678    | ... | 0.901      |
```

**Requirements:**
- Each sheet name becomes the class name
- First row must be headers
- 126 feature columns
- All values numeric

## How to Import

1. **Prepare Your Excel File**
   - Ensure it's in `.xlsx` or `.xls` format
   - Check that you have a header row
   - Verify feature columns are numeric

2. **Open Training Mode**
   - Click "Training Mode" button
   - You'll see the training interface

3. **Click "Import Excel File"**
   - Green button in the training controls section
   - Select your Excel file
   - Wait for processing (may take a moment for large files)

4. **Review Import Results**
   - You'll see how many samples and classes were found
   - Choose to merge or replace existing data

5. **Train Your Model**
   - After import, click "Train Model"
   - Your 27,000 data points will be used for training!

## Excel File Requirements

### Column Structure
- **Minimum**: 126 feature columns (will auto-pad if less)
- **Maximum**: 126 feature columns (will truncate if more)
- **Label Column**: Must be present (auto-detected)

### Data Types
- **Features**: Must be numeric (integers or decimals)
- **Labels**: Text strings (e.g., "A", "B", "HELLO")
- **Empty cells**: Will be treated as 0

### File Size
- **Recommended**: Under 50MB for best performance
- **Maximum**: Browser-dependent (typically 100-200MB)
- **Large files**: May take 30-60 seconds to process

## Common Issues & Solutions

### Issue: "Feature size mismatch"
**Solution**: Ensure you have exactly 126 feature columns, or the converter will auto-adjust

### Issue: "No valid data rows found"
**Solution**: 
- Check that you have data rows (not just headers)
- Ensure rows aren't completely empty
- Verify numeric values in feature columns

### Issue: "Label index out of range"
**Solution**: 
- Check that label column contains valid class names
- Ensure all labels map to existing classes

### Issue: Import is slow
**Solution**: 
- This is normal for large files (27,000 rows)
- Be patient, it's processing all your data
- Consider splitting into smaller files if needed

## Tips for Large Datasets

1. **Pre-process in Excel**
   - Remove empty rows
   - Ensure consistent formatting
   - Check for missing values

2. **Split Large Files**
   - If file is too large, split by class
   - Import each part separately
   - Use "merge" option to combine

3. **Verify After Import**
   - Check "Training Data Statistics"
   - Verify sample counts per class
   - Ensure all classes are present

4. **Training Performance**
   - Large datasets (27K samples) may take 5-10 minutes to train
   - Consider using fewer epochs for initial testing
   - Monitor browser memory usage

## Example Excel Structure

### For ASL Alphabet (A-Z)
```
| Label | F1   | F2   | F3   | ... | F126 |
|-------|------|------|------|-----|------|
| A     | 0.1  | 0.2  | 0.3  | ... | 0.9  |
| A     | 0.2  | 0.3  | 0.4  | ... | 1.0  |
| B     | 0.3  | 0.4  | 0.5  | ... | 1.1  |
| B     | 0.4  | 0.5  | 0.6  | ... | 1.2  |
... (27,000 rows)
```

### For Words
```
| Label  | F1   | F2   | F3   | ... | F126 |
|--------|------|------|------|-----|------|
| HELLO  | 0.1  | 0.2  | 0.3  | ... | 0.9  |
| HELLO  | 0.2  | 0.3  | 0.4  | ... | 1.0  |
| THANKS | 0.3  | 0.4  | 0.5  | ... | 1.1  |
| THANKS | 0.4  | 0.5  | 0.6  | ... | 1.2  |
```

## After Import

1. **Check Statistics**
   - View "Training Data Statistics" section
   - Verify all classes are present
   - Check sample counts

2. **Train Model**
   - Click "Train Model" button
   - Wait for training to complete
   - Model will auto-save

3. **Use Recognition**
   - Switch to Recognition Mode
   - Load the trained model
   - Start recognizing signs!

## Need Help?

If your Excel file doesn't import correctly:
1. Check the browser console for detailed errors
2. Verify your file format matches the examples
3. Try exporting a small sample first to test
4. Ensure all feature values are numeric

---

**Your 27,000 data points are ready to train a powerful model!** 🚀

