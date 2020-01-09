function Print2PDF
{
    [CmdletBinding()]
    param
    (
        [Parameter(Mandatory=$true, ValueFromPipeline=$true, ValueFromPipelinebyPropertyName=$true)]
        [System.IO.FileInfo]
        $FILE_PATH
    )

    process {
        $pdfPath = "$($FILE_PATH.DirectoryName)\$($FILE_PATH.BaseName).pdf"

        $i = 1;
        while ((Test-Path $pdfPath) -and ($i -lt 20)) {
            $pdfPath = "$($FILE_PATH.DirectoryName)\$($FILE_PATH.BaseName) ($i).pdf"
            Write-Host = "PDF path = $pdfPath"
            $i = $i+1
        }

        if (Test-Path $pdfPath) {
            Write-Host "$pdfPath already exist !!!"
            Write-Output ""
            return
        }

        if(($FILE_PATH -like "*.doc") -or ($FILE_PATH -like "*.docx") -or ($FILE_PATH -like "*.docm")) {
            $wordCom = New-Object -ComObject Word.Application
            $doc = $wordCom.Documents.Open($FILE_PATH.FullName)
            Write-Host "$($FILE_PATH.FullName) start ..."
            $doc.SaveAs($pdfPath, 17)
            $doc.Close()
            Write-Host "$pdfPath done ..."
            $wordCom.Quit()
            [System.Runtime.Interopservices.Marshal]::ReleaseComObject($wordCom)
            Write-Output $pdfPath
            return
        }

        if(($FILE_PATH -like "*.ppt") -or ($FILE_PATH -like "*.pptx") -or ($FILE_PATH -like "*.pptm")) {
            $pptCom = New-Object -ComObject PowerPoint.Application
            $doc = $pptCom.Presentations.Open($FILE_PATH.FullName)
            Write-Host "$($FILE_PATH.FullName) start ..."
            $opt= [Microsoft.Office.Interop.PowerPoint.PpSaveAsFileType]::ppSaveAsPDF
            $doc.SaveAs($pdfPath, $opt)
            $doc.Close()
            Write-Host "$pdfPath done ..."
            $pptCom.Quit()
            [System.Runtime.Interopservices.Marshal]::ReleaseComObject($pptCom)
            Write-Output $pdfPath
            return
		}
        
        if ($FILE_PATH.Extension.ToLower() -match '\.(png|jpe?g|tiff?|gif|jf?if|jp2|jpx|j2k|j2c)') {
            Write-Host "Image Print2PDF : $($FILE_PATH.FullName)"
            $size_cmd = magick identify -format "%wx%h" .\back.PNG
            Write-Host $size_cmd
            $ImgWidthOrig = $size_cmd.split('x')[0]
            $ImgHeightOrig = $size_cmd.split('x')[1]
            # A4 size = 595x842
            $alpha_adjust = 0.9839 # facteur d'ajustement pour que ça fasse 21cm x 29.7cm pile (si =1, ça me donne un pdf de 21.35 x 30.18)
            $PaperHeight = $alpha_adjust * 29.7 / 2.5    # inch for ISO A4
            $PaperWidth = $alpha_adjust * 21 / 2.5      # inch for ISO A4
            
            $ImgDens = 2.5 * [math]::Max($ImgWidthOrig / $PaperWidth, $ImgHeightOrig / $PaperHeight)

            $ImgWdth = $PaperWidth * $ImgDens
            $ImgHght = $PaperHeight * $ImgDens

            $margin = 0.5 # en cm
            $ImgWdthMargin = ($PaperWidth - 2 * $margin) * $ImgDens
            $ImgHghtMargin = ($PaperHeight - 2 * $margin) * $ImgDens

            Write-Host = "ImgDens=$($ImgDens) ImgW=$($ImgWdth) ImgH=$($ImgHght)"

            $cmd = "magick convert '$FILE_PATH' "+`
                    "-resize $($ImgWdthMargin)x$($ImgHghtMargin) "+ `
                    "-background white -gravity center "+`
                    "-extent '$($ImgWdth)x$($ImgHght)' "+`
                    "-units PixelsPerInch -set density $ImgDens "+`
                    "-repage '$($ImgWdth)x$($ImgHght)+0+0' "+`
                    "-compress JPEG "+`
                    "-quality 91 "+`
                    "'$pdfPath'"
            Write-Host $cmd
            $res = Invoke-Expression $cmd
        }

        #Write-Host "RES = " + $res
		<# Add-Type -AssemblyName System.Drawing
		$doc = New-Object System.Drawing.Printing.PrintDocument
		$doc.DocumentName = $FILE_PATH.FullName
		$doc.PrinterSettings = new-Object System.Drawing.Printing.PrinterSettings
		$doc.PrinterSettings.PrinterName = 'Microsoft Print to PDF'
		$doc.PrinterSettings.PrintToFile = $true
		$doc.PrinterSettings.PrintFileName = $pdfPath
		$doc.Print()
        $doc.Dispose()
        Write-Output $pdfPath #>
    }
}
Export-ModuleMember -Function 'Print2PDF'