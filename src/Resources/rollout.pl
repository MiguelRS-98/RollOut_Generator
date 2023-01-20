################################################################################
#
# $URL: https://athena.redprairie.com/svn/proj/sceservices/devservices/BuildJiraRollout/trunk/rollout-tools/src/com/redprairie/impser/rollout/pkg/PkgDependencyBuilder.java $
# $Revision: 1042383 $
# $Author: mstraka $
#
# Description: Rollout utility script.
#
# $Copyright-Start$
#
# Copyright (c) 2000-2009
# RedPrairie Corporation
# All Rights Reserved
#
# This software is furnished under a corporate license for use on a
# single computer system and can be copied (with inclusion of the
# above copyright) only for use on such a system.
#
# The information in this document is subject to change without notice
# and should not be construed as a commitment by RedPrairie Corporation.
#
# RedPrairie Corporation assumes no responsibility for the use of the
# software described in this document on equipment which has not been
# supplied or approved by RedPrairie Corporation.
#
# $Copyright-End$
#
################################################################################

# ------------------------------------------------------------------------------
# RETURNS: 0 - Success
#          1 - Failure
#          2 - Warning
# ------------------------------------------------------------------------------

require 5.005;

use English;
use Env;
use File::Basename;
use File::Copy;
use File::Find;
use FindBin;
use IO::Handle;
use Cwd;

# ------------------------------------------------------------------------------
# Global Variables
# ------------------------------------------------------------------------------

my ($Logfile, $HotFix, $HotFixScript, $BackupDirectory);

my $HotFixDirectory = cwd;

my $ExitStatus = 0;

my ($CLEAR, $NORMAL, $BOLD, $REVERSE, $PATH_SEPARATOR);

if ($OSNAME =~ /win32/i)
{
    $CLEAR   = "";
    $NORMAL  = "";
    $BOLD    = "";
    $REVERSE = "";
    $PATH_SEPARATOR = "\\";
}
else
{
    $CLEAR   = `tput clear 2>/dev/null`;
    $NORMAL  = `tput sgr0 2>/dev/null`;
    $BOLD    = `tput bold 2>/dev/null`;
    $REVERSE = `tput rev 2>/dev/null`;
    $PATH_SEPARATOR = "/";
}


# This was pulled from %DEVTOOLS%/tools/Installer.pm.  We cannot include this
# file since it may not exist, so instead we include just the line we want.
@PRODUCT_LIST = qw(moca
                   mcs
                   sal
                   mtf
                   seamles
                   lens
                   hub
                   hubweb
                   ems
                   dcs
                   lm
                   slotting
                   lex
                   cmdrqa
                   dsup
                   scard
                   scrweb
                   dw
                   dwweb
                   tm
                   parcel
                   parceldhl
                   parcelfdx
                   parcelpur
                   parceltnt
                   parcelups
                   parcelusps
                   comptrak
                   rfid
                   rfidweb
                   sm
                   mocarpt
                   sr
);

# ------------------------------------------------------------------------------
#
# FUNCTION: UIclear
#
# PURPOSE:  Clear the screen.
#
# ------------------------------------------------------------------------------

sub UIclear
{
    print "$CLEAR";
}

# ------------------------------------------------------------------------------
#
# FUNCTION: UIprint
#
# PURPOSE:  Print the given message, handling special formating.
#
# ------------------------------------------------------------------------------

sub UIprint
{
    my ($msg) = @_;

    foreach (split(/\^/, $msg))
    {
        if (/^A_/) {UIattrset($_)}
        else { print($_); }
    }
}

# ------------------------------------------------------------------------------
#
# FUNCTION: UIresult
#
# PURPOSE:  Print a result-style message.
#
# ------------------------------------------------------------------------------

sub UIresult
{
    my ($msg) = @_;

    my ($column, $msgLength, $msgMargin);

    print"\n\n";

    # Determine the length of the message.
    $msgLength = length($msg);

    # Determine the margin to center the page title.
    $msgMargin = (80 - $msgLength) / 2;

    # Write the left margin to the page.
    while ((($column++) <= $msgMargin)) { UIprint(" "); }

    # Write the message to the page.
    UIprint("${BOLD}$msg${NORMAL}\n");

    print"\n\n";
}

# ------------------------------------------------------------------------------
#
# FUNCTION: UIattrset
#
# PURPOSE:  Set an attribute for displaying text.
#
# ------------------------------------------------------------------------------

sub UIattrset
{
    my ($attr) = @_;

    my $realAttr;

    if    ($attr eq "A_BOLD"   ) { print "$BOLD"    }
    elsif ($attr eq "A_REVERSE") { print "$REVERSE" }
    elsif ($attr eq "A_NORMAL" ) { print "$NORMAL"  }
}

# ------------------------------------------------------------------------------
#
# FUNCTION: DisplayPageTitle
#
# PURPOSE:  Display the title of the current page.
#
# ------------------------------------------------------------------------------

sub DisplayPageTitle
{
    my ($title) = @_;

    my ($column, $titleLength, $titleMargin);

    # Clear the screen.
    UIclear( );

    # Determine the length of the page title.
    $titleLength = length($title);

    # Determine the margin to center the page title.
    $titleMargin = (80 - $titleLength) / 2;

    # Clear the screen for the new page and turn on reverse mode.
    UIattrset(A_REVERSE);

    # Set our column number.
    $column = 0;

    # Write the left margin to the page.
    while ((($column++) <= $titleMargin)) { UIprint(" "); }

    # Write the title to the page.
    UIprint("$title");

    # Increment our column number.
    $column += $titleLength;

    # Write the right margin to the page.
    while ((($column++) <= 80)) { UIprint(" "); }

    # Turn off reverse mode.
    UIattrset(A_NORMAL);

    UIprint("\n\n\n");
}

# ------------------------------------------------------------------------------
#
# FUNCTION: Datetime
#
# PURPOSE:  Get the current datetime in yyyymmdd-hh24miss format.
#
# ------------------------------------------------------------------------------

sub Datetime
{
    my ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst) = localtime;

    sprintf("%04d%02d%02d-%02d%02d%02d", $year+1900,
                                         $mon+1,
                                         $mday,
                                         $hour,
                                         $min,
                                         $sec);
}

# ------------------------------------------------------------------------------
#
# FUNCTION: SetExitStatus
#
# PURPOSE:  Set the status to exit the script with.  We really just want to make
#           sure that someone doesn't try to reset the overall exit status from
#           a failure status to some non-failure status.
#
# NOTE(S):  Status 0 - Success
#                  1 - Failure
#                  2 - Warning
#
# ------------------------------------------------------------------------------

sub SetExitStatus
{
    my ($status) = @_;

    if ($ExitStatus != 1)
    {
        $ExitStatus = $status;
    }
}

# ------------------------------------------------------------------------------
#
# FUNCTION: GetProductInformation
#
# PURPOSE:  Get information about a product from its code name.
#
# ------------------------------------------------------------------------------

sub GetProductInformation
{
    my ($product) = @_;

    my ($productName, $shortName, $pathname);

    # Derive the product's name and pathname from the given product.
    if ($product =~ /^cafe$/i)
    {
        $productName = "Cafe";
        $shortName   = "cafe";
        $pathname    = "%CAFEDIR%";
    }
    elsif ($product =~ /^cmdrqa$/i)
    {
        $productName = "Commander QA";
        $shortName   = "cmdrqa";
        $pathname    = "%CMDRQADIR%";
    }
    elsif ($product =~ /^comptrak$/i)
    {
        $productName = "CompTrak";
        $shortName   = "comptrak";
        $pathname    = "%CTDIR%";
    }
    elsif ($product =~ /^dcs$/i)
    {
	$productName = "WM/d";
	$shortName   = "dcs";
        $pathname    = "%DCSDIR%";
    }
    elsif ($product =~ /^dsup$/i)
    {
	$productName = "Digital Supplier";
	$shortName   = "dsup";
        $pathname    = "%DSUPDIR%";
    }
    elsif ($product =~ /^dw$/i)
    {
        $productName = "DW";
        $shortName   = "dw";
        $pathname    = "%DWDIR%";
    }
    elsif ($product =~ /^dwweb$/i)
    {
        $productName = "DWWEB";
        $shortName   = "dwweb";
        $pathname    = "%DWWEBDIR%";
    }
    elsif ($product =~ /^ems$/i)
    {
	$productName = "EMS";
        $shortName   = "ems";
        $pathname    = "%EMSDIR%";
    }
    elsif ($product =~ /^env$/i)
    {
	$productName = "Environment";
        $shortName   = "env";
        $pathname    = "%LESDIR%";
    }
    elsif ($product =~ /^hub$/i)
    {
	$productName = "HUB";
        $shortName   = "hub";
        $pathname    = "%HUBDIR%";
    }
    elsif ($product =~ /^mcs$/i)
    {
	$productName = "MCS";
        $shortName   = "mcs";
        $pathname    = "%MCSDIR%";
    }
    elsif ($product =~ /^moca$/i)
    {
	$productName = "MOCA";
        $shortName   = "moca";
        $pathname    = "%MOCADIR%";
    }
    elsif ($product =~ /^mocarpt$/i)
    {
	$productName = "MOCA Reports";
        $shortName   = "mocarpt";
        $pathname    = "%MOCARPTDIR%";
    }
    elsif ($product =~ /^mrm$/i)
    {
	$productName = "MRM";
        $shortName   = "mrm";
        $pathname    = "%MRMDIR%";
    }
    elsif ($product =~ /^mtf$/i)
    {
	$productName = "MTF";
        $shortName   = "mtf";
        $pathname    = "%MTFDIR%";
    }
    elsif ($product =~ /^lens$/i)
    {
        $productName = "LENS";
        $shortName   = "lens";
        $pathname    = "%LENSDIR%";
    }
    elsif ($product =~ /^les$/i)
    {
	$productName = "LES";
        $shortName   = "les";
        $pathname    = "%LESDIR%";
    }
    elsif ($product =~ /^lm$/i)
    {
	$productName = "WFM";
        $shortName   = "lm";
        $pathname    = "%LMDIR%";
    }
    elsif ($product =~ /^parcel$/i)
    {
	$productName = "Parcel";
        $shortName   = "parcel";
        $pathname    = "%PARCELDIR%";
    }
    elsif ($product =~ /^parcelups$/i)
    {
	$productName = "ParcelUPS";
        $shortName   = "parcelups";
        $pathname    = "%PARCELUPSDIR%";
    }
    elsif ($product =~ /^parcelfdx$/i)
    {
	$productName = "ParcelFDX";
        $shortName   = "parcelfdx";
        $pathname    = "%PARCELFDXDIR%";
    }
    elsif ($product =~ /^parcelusps$/i)
    {
	$productName = "ParcelUSPS";
        $shortName   = "parcelusps";
        $pathname    = "%PARCELUSPSDIR%";
    }
    elsif ($product =~ /^parceldhl$/i)
    {
	$productName = "ParcelDHL";
        $shortName   = "parceldhl";
        $pathname    = "%PARCELDHLDIR%";
    }
    elsif ($product =~ /^parcelpur$/i)
    {
	$productName = "ParcelPUR";
        $shortName   = "parcelpur";
        $pathname    = "%PARCELPURDIR%";
    }
    elsif ($product =~ /^parceltnt$/i)
    {
	$productName = "ParcelTNT";
        $shortName   = "parceltnt";
        $pathname    = "%PARCELTNTDIR%";
    }
    elsif ($product =~ /^rfid$/i)
    {
	$productName = "RFID";
        $shortName   = "rfid";
        $pathname    = "%RFIDDIR%";
    }
    elsif ($product =~ /^sal$/i)
    {
	$productName = "SAL";
        $shortName   = "sal";
        $pathname    = "%SALDIR%";
    }
    elsif ($product =~ /^scard$/i)
    {
	$productName = "Scorecard";
        $shortName   = "scard";
        $pathname    = "%SCARDDIR%";
    }
    elsif ($product =~ /^seamles$/i)
    {
	$productName = "Integrator";
        $shortName   = "sl";
        $pathname    = "%SLDIR%";
    }
    elsif ($product =~ /^slotting$/i)
    {
	$productName = "Slotting";
        $shortName   = "slot";
        $pathname    = "%SLOTDIR%";
    }
    elsif ($product =~ /^sm$/i)
    {
	$productName = "SM";
        $shortName   = "sm";
        $pathname    = "%SMDIR%";
    }
    elsif ($product =~ /^sr$/i)
    {
	$productName = "SourceRight";
        $shortName   = "sr";
        $pathname    = "%SRDIR%";
    }
    elsif ($product =~ /^tm$/i)
    {
	$productName = "TM";
        $shortName   = "tm";
        $pathname    = "%TMDIR%";
    }
    elsif ($product =~ /^waffle$/i)
    {
	$productName = "WAFFLE";
        $shortName   = "waffle";
        $pathname    = "%WAFFLEDIR%";
    }
    else
    {
	print LOGFILE "\n";
	print LOGFILE "ERROR: The product is not valid.\n";
        print LOGFILE "Product: $product\n\n";
	return(undef);
    }

    # Expand any embedded environment variables.
    $pathname = ExpandEnvVars($pathname);

    # Make sure the directory exists.
    if (! -d $pathname)
    {
	print LOGFILE "\n";
	print LOGFILE "ERROR: The product pathname does not exist.\n";
        print LOGFILE "Product: $product\n\n";
	return(undef);
    }

    return($productName, $pathname, $shortName);
}

# ------------------------------------------------------------------------------
#
# FUNCTION: RegisterDlls
#
# PURPOSE:  Register Dll's copied from a mapped/mounted drive.
#
# ------------------------------------------------------------------------------

sub RegisterDlls
{
    my ($pathname) = @_;

    sub RegisterDll
    {
        my $filename = basename($File::Find::name);

	if ($filename =~ /.*\.dll$/)
	{
	    print LOGFILE "Registering $filename...\n";
	    system("regsvr32 /s $filename");
	}
    }

    # Find all files with a .dll extension.
    find(\&RegisterDll, "$pathname");

    return;
}

# ------------------------------------------------------------------------------
#
# FUNCTION: CheckRequirements
#
# PURPOSE:  Check rollout requirements.
#
# ------------------------------------------------------------------------------

sub CheckRequirements
{
    # Check the directory we're running from.
    if ($FindBin::Bin =~ /\s/)
    {
        print "ERROR: The directory the rollout is in contains whitespace.\n";
        return 1;
    }

    # Make sure required environment variables are exported.
    if (! "$ENV{LESDIR}")
    {
        print "ERROR: LESDIR is not set.\n";
        return 1;
    }
    if (! "$ENV{MOCADIR}")
    {
        print "WARNING: MOCADIR is not set.\n";
        print LOGFILE "\n";
    	print LOGFILE "WARNING: MOCADIR is not set. \n";
    }
    if (! "$ENV{MOCA_REGISTRY}")
    {
        print "WARNING: MOCA_REGISTRY is not set.\n";
        print LOGFILE "\n";
    	print LOGFILE "WARNING: MOCA_REGISTRY is not set. \n";
    }

    return 0;
}

# ------------------------------------------------------------------------------
#
# FUNCTION: GetEnvVar
#
# PURPOSE:  Get the value of the given environment variable.
#
# ------------------------------------------------------------------------------

sub GetEnvVar
{
    my $varname = shift;
    my $value;
    my $tmp_varname;

    $tmp_varname = "NOTHING";

    # If attempting to do waffle then we must dance a little.
    if ($varname eq "WAFFLEDIR")
    {
        $varname = "LESDIR";
        $tmp_varname = "WAFFLEDIR";
    }

    # Get the environment variable from the environment itself.
    $value = $ENV{$varname};

    # If attempting to do waffle then we must dance some more.
    if ($tmp_varname eq "WAFFLEDIR")
    {
        $value = "$value${PATH_SEPARATOR}..${PATH_SEPARATOR}waffle";
    }

    return $value;
}

# ------------------------------------------------------------------------------
#
# FUNCTION: ExpandEnvVars
#
# PURPOSE:  Expand the environment variables in the given string.
#
# ------------------------------------------------------------------------------

sub ExpandEnvVars
{
    my $string = shift;

    # Expand the pseudo SOURCEDIR environment variable.
    $string =~ s/\$SOURCEDIR/$HotFixDirectory/ge;
    $string =~ s/%SOURCEDIR%/$HotFixDirectory/ge;

    # Expand the pseudo HOTFIX environment variable.
    $string =~ s/\$HOTFIX/$HotFix/ge;
    $string =~ s/%HOTFIX%/$HotFix/ge;

    # Expand all other environment variables.
    $string =~ s/\$([A-Za-z0-9_]*)/GetEnvVar($1)/ge;
    $string =~ s/%([A-Za-z0-9_]*)%/GetEnvVar($1)/ge;

    return $string;
}

# ------------------------------------------------------------------------------
#
# FUNCTION: MSQLExec
#
# PURPOSE:  Execute a MOCA sql statement.
#
# ------------------------------------------------------------------------------

sub MSQLExec
{
    my ($stmt, $dba_arg, $force_result) = @_;

    my $msg = "";
    my $tempi = 0;

    #
    # TODO: using open2 or open3 would be a better solution
    #
    if ($OSNAME eq "MSWin32")
    {
       $msg = `echo $stmt | msql -isS $dba_arg`;
       $status = $? >> 8;
    }
    else
    {
       $msg = `echo "$stmt" | msql -isS $dba_arg`;
       $status = $? >> 8;
    }

    # Convert to a list.
    @result_full = split(/\n/,$msg);

    # Remove extra lines.
    @result = @result_full;
    @tmp_result = ();

    for ($tempi=0; $tempi < @result; $tempi++)
    {
        if (@result[$tempi] =~ /^---/)
        {
            $i = $tempi + 1;
            break;
        }
    }

    if ($i == 0)
    {
        $i=7;
    }

    for ($i=$i; $i < @result; $i++)
    {
        @tmp_result = (@tmp_result, $result[$i]);
    }
    @result = @tmp_result;

    if ($status != 0 && $force_result ne "Y")
    {
        return ($status, @result_full);
    }
    else
    {
        return ($status, @result);
    }
}

# ------------------------------------------------------------------------------
#
# FUNCTION: GetProductDbVersion
#
# PURPOSE:  Get the given product's db schema version.
#
# ------------------------------------------------------------------------------

sub GetProductDbVersion
{
    my ($product) = @_;

    # Get information about this product.
    my ($productName, $pathname, $shortName) = GetProductInformation($product);

    # Remove extra versions.
    $stmt = "[ delete from ${shortName}_dbversion                " .
            "   where version != ( select max(version)                   " .
            "                      from ${shortName}_dbversion) ]";

    # Execute SQL statement through MSQL.
    ($status, @result) = MSQLExec($stmt);

    # Build the SQL statement.
    $stmt = "[ select version from ${shortName}_dbversion ]";

    $force_result = "Y";
    $dba_parm = " ";

    # execute SQL statement through MSQL.
    ($status, @result) = MSQLExec($stmt, $dba_parm, $force_result);
    $lastNum = $#result;

    # Parse out the version.
    $version = $result[$lastNum];
    $version =~ s/ *$//g;  # Remove white space

    return $version;
}

# ------------------------------------------------------------------------------
#
# FUNCTION: GetProductDbDatasets
#
# PURPOSE:  Get the given product's currently loaded data sets.
#
# ------------------------------------------------------------------------------

sub GetProductDbDatasets
{
    my ($product) = @_;

    my @datasets = ();

    # Get information about this product.
    my ($productName, $pathname, $shortName) = GetProductInformation($product);

    # Build the SQL statement.
    $stmt = "[select distinct ds_dir, ds_seq      " .
            "   from ${shortName}_dataset " .
            "  order by ds_seq]                   ";

    # Execute SQL statement through MSQL
    ($status, @result) = MSQLExec($stmt);

    if ($status eq 0)
    {
        # Remove extra columns.
        @datasets = @result;
        for $value (@datasets)
        {
            @tmp_value = split(/ /,$value);
            $value = @tmp_value[0];
        }

        # Expand environment variables in each row.
        for $value (@datasets)
        {
            $value =~ s/\$([A-Za-z0-9_]*)/$ENV{$1}/ge;
        }
    }

    return @datasets;
}

# ------------------------------------------------------------------------------
#
# FUNCTION: Add
#
# PURPOSE:  Add a new file from a rollout.
#
# ------------------------------------------------------------------------------

sub Add
{
    my ($source, $target) = @_;

    my $status;

    # Expand any embedded environment variables.
    $source = ExpandEnvVars("%SOURCEDIR%/$source");
    $target = ExpandEnvVars("$target");

    # Write a message to the logfile.
    print LOGFILE "\n===> Adding file...\n\n";
    print LOGFILE "Source: $source\n";
    print LOGFILE "Target: $target\n";

    # If target directory does not exist, create it.
    if (! -d "$target")
    {
	CreateDir ("$target");
	if (! -d "$target")
	{
	    SetExitStatus(1);
	    return;
	}
    }

    # Change to the rollout directory.
    chdir("$HotFixDirectory");

    # Add the file.
    $status = copy("$source", "$target");
    if ($status == 0)
    {
	print LOGFILE "\n";
	print LOGFILE "ERROR: Could not add file.\n";
	print LOGFILE "       $!\n";
	SetExitStatus(1);
	return;
    }

    return;
}

# ------------------------------------------------------------------------------
#
# FUNCTION: ChangeDir
#
# PURPOSE:  Change to the given directory.
#
# ------------------------------------------------------------------------------

sub ChangeDir
{
    my ($target) = @_;
    my $status = 0;

    $target = ExpandEnvVars($target);
    $status = chdir("$target");
    if ($status == 0)
    {
	print LOGFILE "\n";
	print LOGFILE "ERROR: Could not change to directory: $target \n";
	print LOGFILE "       $!\n";
	SetExitStatus(1);
	return;
    }

    return;
}

# ------------------------------------------------------------------------------
#
# FUNCTION: CreateDir
#
# PURPOSE:  Create a new directory
#
# ------------------------------------------------------------------------------

sub CreateDir
{
    my ($target) = @_;

    my $status = 0;

    # Expand any embedded environment variables.
    $target = ExpandEnvVars("$target");

    # Write a message to the logfile.
    print LOGFILE "\n===> Creating Directory: $target \n";

    # Make sure the directory does not exist.
    if ( -d "$target")
    {
	print LOGFILE "\n";
	print LOGFILE "WARNING: Directory already exists.\n";
	SetExitStatus(2);
	return;
    }

    # Create the target directory and any intermediate directories as necessary.
    CreateIntermediateDir($target);

    return;
}

# ------------------------------------------------------------------------------
#
# FUNCTION: CreateIntermediateDir
#
# PURPOSE:  A helper function for CreateDir. Create the target Directory and
#           any Intermediate directories as necessary.  Recursive.
#
# ------------------------------------------------------------------------------

sub CreateIntermediateDir
{
    my ($target) = @_;

    my $status = 0, $parent_dir;

    if ( -d "$target")
    {
	# Furthest up as we can go.
	return;
    }

    # Create the intermediate directory.
    $parent_dir = dirname($target);
    CreateIntermediateDir($parent_dir);

    # Create the directory.
    $status = mkdir("$target", 0775);
    if ($status == 0)
    {
	print LOGFILE "\n";
	print LOGFILE "ERROR: Could not create the directory. \n";
	print LOGFILE "       $!\n";
	print LOGFILE "       Directory: $target\n";
	SetExitStatus(1);
	return;
    }

    return;
}

# ------------------------------------------------------------------------------
#
# FUNCTION: DbUpgrade
#
# PURPOSE:  Load all the safetoload data for a given product.
#
# ------------------------------------------------------------------------------

sub DbUpgrade
{
    my ($product) = @_;

    my $status = 0;

    my $command;

    # Get information about this product.
    my ($productName, $pathname, $shortName) = GetProductInformation($product);

    # Get the current database version.
    my $dbversion = GetProductDbVersion($product);

    # Write a message to the logfile.
    print LOGFILE "\n===> Upgrading database...\n\n";
    print LOGFILE "Product: $productName\n";
    print LOGFILE "Version: $dbversion\n";

    # Change to the database data load directory.
    if (! chdir("$pathname/db/upgrade"))
    {
	print LOGFILE "\n";
	print LOGFILE "ERROR: Could not change to the database upgrade directory.\n";
	print LOGFILE "       $!\n";
	SetExitStatus(1);
	return;
    }

    if (-r "$MOCADIR/scripts/dbupgrade.pl")
    {
        $status = DbUpgrade_Legacy($dbversion);
    }
    else
    {
        $status = DbUpgrade_NG($dbversion);
    }

    # Check the status from the system call.
    if ($status != 0)
    {
	print LOGFILE "\n";
	print LOGFILE "ERROR: Could not upgrade database.\n";
	SetExitStatus(1);
	return;
    }

    return;
}

# ------------------------------------------------------------------------------
#
# FUNCTION: DbUpgrade_NG
#
# PURPOSE:  Load all the safetoload data for a given product for an
#           NG environment.
#
# ------------------------------------------------------------------------------

sub DbUpgrade_NG
{
    my ($dbversion) = @_;

    my $status = 0;

    # Close the logfile.
    close(LOGFILE);

    # Execute the script.
    system("dbupgrade -v $dbversion >>$Logfile 2>&1");
    if ($? != 0)
    {
        $status = 1;
    }

    # Open the logfile and set auto flushing.
    open(LOGFILE, ">>$Logfile");
    LOGFILE->autoflush(1);

    return $status;
}

# ------------------------------------------------------------------------------
#
# FUNCTION: DbUpgrade_Legacy
#
# PURPOSE:  Load all the safetoload data for a given product for a
#           legacy environment.
#
# ------------------------------------------------------------------------------

sub DbUpgrade_Legacy
{
    my ($dbversion) = @_;

    my $status = 0;

    # Close the logfile.
    close(LOGFILE);

    # Execute the script.
    system("perl $MOCADIR/scripts/dbupgrade.pl -v $dbversion >>$Logfile 2>&1");
    if ($? != 0)
    {
        $status = 1;
    }

    # Open the logfile and set auto flushing.
    open(LOGFILE, ">>$Logfile");
    LOGFILE->autoflush(1);

    return $status;
}

# ------------------------------------------------------------------------------
#
# FUNCTION: ImportSLData
#
# PURPOSE:  Import a Integrator export file via the slImp utility.
#
# ------------------------------------------------------------------------------

sub ImportSLData
{
    my ($pathname, $insertOnly) = @_;

    my $status = 0;

    my $command;

    # Change to the rollout directory.
    chdir("$HotFixDirectory");

    # Expand any embedded environment variables.
    $pathname  = ExpandEnvVars("$pathname");

    # Write a message to the logfile.
    print LOGFILE "\n===> Importing Integrator export file...\n\n";
    print LOGFILE "Export File: $pathname\n";
    print LOGFILE "Option(s)  : $insertOnly\n";

    # Make sure the export file exists.
    if (! -r "$pathname")
    {
	print LOGFILE "\n";
	print LOGFILE "ERROR: Export file does not exist.\n";
	SetExitStatus(1);
	return;
    }

    # Close the logfile.
    close(LOGFILE);

    # Build the command to execute.
    if ("$insertOnly")
    {
        $command = "$SLDIR/bin/slImp -v -f $pathname -i";
    }
    else
    {
        $command = "$SLDIR/bin/slImp -v -f $pathname";
    }

    # Execute the command.
    system("$command >>$Logfile 2>&1");
    if ($? != 0)
    {
	$status = 1;
    }

    # Open the logfile and set auto flushing.
    open(LOGFILE, ">>$Logfile");
    LOGFILE->autoflush(1);

    # Check the status from the system call.
    if ($status != 0)
    {
	print LOGFILE "\n";
	print LOGFILE "ERROR: Could not import the Integrator export file.\n";
	SetExitStatus(1);
	return;
    }

    return;
}

# ------------------------------------------------------------------------------
#
# FUNCTION: LoadData
#
# PURPOSE:  Load a data file via the mload utility.
#
# ------------------------------------------------------------------------------

sub LoadData
{
    my ($ctlPathname, $dataFile) = @_;

    my ($command, $directory, $ctlFile, $dbDir, $dataDir);

    my $status = 0;

    # Expand any embedded environment variables.
    $ctlPathname  = ExpandEnvVars("$ctlPathname");
    $dataFile     = ExpandEnvVars("$dataFile");

    # Determine the control file, database data load and data directory.
    $ctlFile = basename("$ctlPathname");
    $dbDir   = dirname("$ctlPathname");
    $dataDir = "$ctlFile";
    $dataDir =~ s/\.ctl$//;

    # Write a message to the logfile.
    print LOGFILE "\n===> Loading data file...\n\n";
    print LOGFILE "Control File: $ctlFile\n";
    print LOGFILE "Data File   : $dataFile\n";

    # Make sure the control file exists.
    if (! -r "$ctlPathname")
    {
	print LOGFILE "\n";
	print LOGFILE "ERROR: Control file does not exist.\n";
	SetExitStatus(1);
	return;
    }

    # Make sure the data file exists.
    if (! -r "$dbDir/$dataDir/$dataFile")
    {
	print LOGFILE "\n";
	print LOGFILE "ERROR: Data file does not exist.\n";
	SetExitStatus(1);
	return;
    }

    # Change to the database data load directory.
    if (! chdir("$dbDir"))
    {
	print LOGFILE "\n";
	print LOGFILE "ERROR: Could not change to the db data load directory.\n";
	print LOGFILE "       $!\n";
	SetExitStatus(1);
	return;
    }

    # Close the logfile.
    close(LOGFILE);

    # Build the command to execute.
    $command = "mload -H -D $dataDir -d $dataFile -c $ctlFile";

    # Execute the command.
    system("$command >>$Logfile 2>&1");
    if ($? != 0)
    {
	$status = 1;
    }

    # Open the logfile and set auto flushing.
    open(LOGFILE, ">>$Logfile");
    LOGFILE->autoflush(1);

    # Check the status from the system call.
    if ($status != 0)
    {
	print LOGFILE "\n";
	print LOGFILE "ERROR: Could not load the data file.\n";
	SetExitStatus(1);
	return;
    }

    return;
}

# ------------------------------------------------------------------------------
#
# FUNCTION: LoadDataDir
#
# PURPOSE:  Load a data directory via the mload utility.
#
# ------------------------------------------------------------------------------

sub LoadDataDir
{
    my ($ctlPathname) = @_;

    my ($command, $directory, $ctlFile, $dbDir, $dataDir);

    my $status = 0;

    # Expand any embedded environment variables.
    $ctlPathname  = ExpandEnvVars("$ctlPathname");

    # Determine the control file, database data load and data directory.
    $ctlFile = basename("$ctlPathname");
    $dbDir   = dirname("$ctlPathname");
    $dataDir = "$ctlFile";
    $dataDir =~ s/\.ctl$//;

    # Write a message to the logfile.
    print LOGFILE "\n===> Loading data directory...\n\n";
    print LOGFILE "Control File: $ctlFile\n";
    print LOGFILE "Data     Dir: $dbDir\n";

    # Make sure the control file exists.
    if (! -r "$ctlPathname")
    {
	print LOGFILE "\n";
	print LOGFILE "ERROR: Control file does not exist.\n";
	SetExitStatus(1);
	return;
    }

    # Change to the database data load directory.
    if (! chdir("$dbDir"))
    {
	print LOGFILE "\n";
	print LOGFILE "ERROR: Could not change to the db data load directory.\n";
	print LOGFILE "       $!\n";
	SetExitStatus(1);
	return;
    }

    # Close the logfile.
    close(LOGFILE);

    # Build the command to execute.
    $command = "mload -H -c $ctlFile -D $dataDir" ;

    # Execute the command.
    system("$command >>$Logfile 2>&1");
    if ($? != 0)
    {
	$status = 1;
    }

    # Open the logfile and set auto flushing.
    open(LOGFILE, ">>$Logfile");
    LOGFILE->autoflush(1);

    # Check the status from the system call.
    if ($status != 0)
    {
	print LOGFILE "\n";
	print LOGFILE "ERROR: Could not load the data file.\n";
	SetExitStatus(1);
	return;
    }

    return;
}

# ------------------------------------------------------------------------------
#
# FUNCTION: LoadSafeData
#
# PURPOSE:  Load all the safetoload data for a given product.
#
# ------------------------------------------------------------------------------

sub LoadSafeData
{
    my ($product) = @_;

    my ($command, $directory, $ctlFile, $dbDir, $dataDir);

    my $status = 0;

    my (@layerdProductList);

    my $isAfterSelectedProduct = 0;

    foreach $layeredProduct (@PRODUCT_LIST)
    {
        if (lc($product) eq lc($layeredProduct))
        {
            $isAfterSelectedProduct = 1;
        }

        if ((ProductIsInstalled($layeredProduct)) and ($isAfterSelectedProduct))
        {
            push @layerdProductList, $layeredProduct;
        }
    }

    foreach $layeredProduct (@layerdProductList)
    {
        # Get the datasets for this layered product.
        my @dirs = GetProductDbDatasets($layeredProduct);

        # Cycle through each directory.
        foreach $dir (@dirs)
        {
            # A safetoload directory may not exist for this dataset.
            if (! -r "$dir/safetoload")
            {
                next;
            }

            # Write a message to the logfile.
            print LOGFILE "\n===> Loading safetoload data...\n\n";
            print LOGFILE "Product  : $layeredProduct\n";
            print LOGFILE "Directory: $dir\n";

            # Change to the database data load directory.
            if (! chdir("$dir/safetoload"))
            {
                print LOGFILE "\n";
                print LOGFILE "ERROR: Could not change to the safetoload directory.\n";
                print LOGFILE "       $!\n";
                SetExitStatus(1);
                return;
            }

            # Load all the data.
	    $status = MloadAllExec( );

            # Check the status from the system call.
            if ($status != 0)
            {
                print LOGFILE "\n";
                print LOGFILE "ERROR: Could not load safetoload data.\n";
                print LOGFILE "       Directory: $dir/safetoload\n";
                SetExitStatus(1);
                return;
            }
        }
    }

    return;
}

# ------------------------------------------------------------------------------
#
# FUNCTION: MloadAllExec
#
# PURPOSE:  Load all data for the current directory.
#
# ------------------------------------------------------------------------------

sub MloadAllExec
{
    my $status = 0;

    if (-r "$MOCADIR/scripts/mload_all.pl")
    {
        $status = MloadAllExec_Legacy( );
    }
    else
    {
        $status = MloadAllExec_NG( );
    }

    return $status;
}

# ------------------------------------------------------------------------------
#
# FUNCTION: MloadAllExec_NG
#
# PURPOSE:  Load all data for the current directory for an NG environment.
#
# ------------------------------------------------------------------------------

sub MloadAllExec_NG
{
    my ($script) = @_;

    my $status = 0;

    # Close the logfile.
    close(LOGFILE);

    # Execute the script.
    system("mload_all >>$Logfile 2>&1");
    if ($? != 0)
    {
        $status = 1;
    }

    # Open the logfile and set auto flushing.
    open(LOGFILE, ">>$Logfile");
    LOGFILE->autoflush(1);

    return $status;
}

# ------------------------------------------------------------------------------
#
# FUNCTION: MloadAllExec_Legacy
#
# PURPOSE:  Load all data for the current directory for a legacy environment.
#
# ------------------------------------------------------------------------------

sub MloadAllExec_Legacy
{
    my $status = 0;

    # Close the logfile.
    close(LOGFILE);

    # Execute the script.
    system("perl $MOCADIR/scripts/mload_all.pl >>$Logfile 2>&1");
    if ($? != 0)
    {
        $status = 1;
    }

    # Open the logfile and set auto flushing.
    open(LOGFILE, ">>$Logfile");
    LOGFILE->autoflush(1);

    return $status;
}

# ------------------------------------------------------------------------------
#
# FUNCTION: LoadSLData
#
# PURPOSE:  Load a Integrator data file via the slLoad utility.
#
# ------------------------------------------------------------------------------

sub LoadSLData
{
    my ($slname) = @_;

    my ($command, $directory);

    my $status = 0;

    # Expand any embedded environment variables.
    $slname  = ExpandEnvVars("$slname");

    # Write a message to the logfile.
    print LOGFILE "\n===> Loading Integrator data file...\n\n";
    print LOGFILE "System Name: $slname\n";

    # Build the command to execute.
    if (-d "$SLDIR/db/data/slload/rawdata/$slname")
    {
        $command = "$SLDIR/scripts/slLoad_rawdata.pl -s $slname -V -l";
    }
    elsif (-d "$SLDIR/db/data/slload/data/$slname")
    {
	$command = "$SLDIR/scripts/slLoad_all.pl -s $slname -V";
    }
    else
    {
	print LOGFILE "\n";
	print LOGFILE "ERROR: System name does not exist.\n";
	SetExitStatus(1);
	return;
    }

    # Close the logfile.
    close(LOGFILE);

    # Execute the command.
    system("$command >>$Logfile 2>&1");
    if ($? != 0)
    {
	$status = 1;
    }

    # Open the logfile and set auto flushing.
    open(LOGFILE, ">>$Logfile");
    LOGFILE->autoflush(1);

    # Check the status from the system call.
    if ($status != 0)
    {
	print LOGFILE "\n";
	print LOGFILE "ERROR: Could not load the Integrator data file.\n";
	SetExitStatus(1);
	return;
    }

    return;
}

# ------------------------------------------------------------------------------
#
# FUNCTION: Mbuild
#
# PURPOSE:  Rebuild the commands memory file.
#
# ------------------------------------------------------------------------------

sub Mbuild
{
    my $command;

    my $status = 0;

    # Write a message to the logfile.
    print LOGFILE "\n===> Rebuilding the commands memory file...\n\n";

    # Close the logfile.
    close(LOGFILE);

    # Build the command to execute.
    $command = "mbuild";

    # Rebuild the commands memory file.
    system("$command >>$Logfile 2>&1");
    if ($? != 0)
    {
        $status = 1;
    }

    # Open the logfile and set auto flushing.
    open(LOGFILE, ">>$Logfile");
    LOGFILE->autoflush(1);

    # Check the status from the system call.
    if ($status != 0)
    {
	print LOGFILE "\n";
	print LOGFILE "ERROR: Could not rebuild the commands memory file.\n";
	SetExitStatus(1);
	return;
    }

    return;
}

# ------------------------------------------------------------------------------
#
# FUNCTION: MTFLink
#
# PURPOSE:  Relink the MTF files.
#
# ------------------------------------------------------------------------------

sub MTFLink
{
    my $command;

    my $status = 0;

    # Write a message to the logfile.
    print LOGFILE "\n===> Relinking MTF files...\n\n";

    # Change to the data directory.
    chdir("$LESDIR/data");

    # Close the logfile.
    close(LOGFILE);

    # Build the command to execute.
    $command = "perl $MCSDIR/scripts/mtflink.pl -h";

    # Relink the MTF handheld files.
    system("$command >>$Logfile 2>&1");
    if ($? != 0)
    {
        $status = 1;
    }

    # Open the logfile and set auto flushing.
    open(LOGFILE, ">>$Logfile");
    LOGFILE->autoflush(1);

    # Check the status from the system call.
    if ($status != 0)
    {
	print LOGFILE "\n";
	print LOGFILE "ERROR: Could not relink MTF handheld files.\n";
	SetExitStatus(1);
	return;
    }

    # Close the logfile.
    close(LOGFILE);

    # Build the command to execute.
    $command = "perl $MCSDIR/scripts/mtflink.pl -v";

    # Relink the MTF vehicle files.
    system("$command >>$Logfile 2>&1");
    if ($? != 0)
    {
        $status = 1;
    }

    # Open the logfile and set auto flushing.
    open(LOGFILE, ">>$Logfile");
    LOGFILE->autoflush(1);

    # Check the status from the system call.
    if ($status != 0)
    {
	print LOGFILE "\n";
	print LOGFILE "ERROR: Could not relink MTF vehicle files.\n";
	SetExitStatus(1);
	return;
    }

    return;
}

# ------------------------------------------------------------------------------
#
# FUNCTION: ProductIsInstalled
#
# PURPOSE:  Determine if the given product is installed.
#
# SOURCE: Copied from the %DEVTOOLS%/tools/Installer.pm. Since this file may not
#         be available we cannot include it, instead just copied this function.
#
# ------------------------------------------------------------------------------

sub ProductIsInstalled
{
    my ($product) = @_;

    # Check the product's environment variable.
    if (($product =~ /^dcs$/i        && ! "$DCSDIR")       ||
        ($product =~ /^tm$/i         && ! "$TMDIR")        ||
        ($product =~ /^cmdrqa$/i     && ! "$CMDRQADIR")    ||
        ($product =~ /^dsup$/i       && ! "$DSUPDIR")      ||
        ($product =~ /^scard$/i      && ! "$SCARDDIR")     ||
        ($product =~ /^scrweb$/i     && ! "$SCARDWEBDIR")  ||
        ($product =~ /^dw$/i         && ! "$DWDIR")        ||
        ($product =~ /^dwweb$/i      && ! "$DWWEBDIR")     ||
        ($product =~ /^lens$/i       && ! "$LENSDIR")      ||
        ($product =~ /^hub$/i        && ! "$HUBDIR")       ||
        ($product =~ /^hubweb$/i     && ! "$HUBWEBDIR")    ||
        ($product =~ /^ems$/i        && ! "$EMSDIR")       ||
        ($product =~ /^lm$/i         && ! "$LMDIR")        ||
        ($product =~ /^lex$/i        && ! "$LEXDIR")       ||
        ($product =~ /^mcs$/i        && ! "$MCSDIR")       ||
        ($product =~ /^moca$/i       && ! "$MOCADIR")      ||
        ($product =~ /^mtf$/i        && ! "$MTFDIR")       ||
        ($product =~ /^sal$/i        && ! "$SALDIR")       ||
        ($product =~ /^seamles$/i    && ! "$SLDIR")        ||
        ($product =~ /^slotting$/i   && ! "$SLOTDIR")      ||
        ($product =~ /^comptrak$/i   && ! "$CTDIR")        ||
        ($product =~ /^rfid$/i       && ! "$RFIDDIR")      ||
        ($product =~ /^rfidweb$/i    && ! "$RFIDWEBDIR")   ||
        ($product =~ /^sm$/i         && ! "$SMDIR")        ||
        ($product =~ /^mocarpt$/i    && ! "$MOCARPTDIR")   ||
        ($product =~ /^sr$/i         && ! "$SRDIR")        ||
        ($product =~ /^mrm$/i        && ! "$MRMDIR")       ||
        ($product =~ /^mrmweb$/i     && ! "$MRMWEBDIR")    ||
        ($product =~ /^parcel$/i     && ! "$PARCELDIR")    ||
        ($product =~ /^parceldhl$/i  && ! "$PARCELDHLDIR") ||
        ($product =~ /^parcelfdx$/i  && ! "$PARCELFDXDIR") ||
        ($product =~ /^parcelpur$/i  && ! "$PARCELPURDIR") ||
        ($product =~ /^parceltnt$/i  && ! "$PARCELTNTDIR") ||
        ($product =~ /^parcelups$/i  && ! "$PARCELUPSDIR") ||
        ($product =~ /^parcelusps$/i && ! "$PARCELUSPSDIR"))
    {
        return 0;
    }

    return 1;
}

# ------------------------------------------------------------------------------
#
# FUNCTION: Rebuild
#
# PURPOSE:  Rebuild a product via 'make rebuild'.
#
# ------------------------------------------------------------------------------

sub Rebuild
{
    my ($product) = @_;

    my ($command, $productName, $pathname, $shortName);

    my $status = 0;

    # Write a message to the logfile.
    print LOGFILE "\n===> Rebuilding product...\n\n";

    # Make sure a product was given.
    if (! "$product")
    {
        print LOGFILE "\n";
        print LOGFILE "ERROR: A product name was not provided.\n";
        SetExitStatus(1);
        return;
    }

    # Get information about this product.
    ($productName, $pathname, $shortName) = GetProductInformation($product);
    if (! $pathname)
    {
        SetExitStatus(1);
        return;
    }

    print LOGFILE "Product Name: $productName\n\n";

    # Change to the product's directory.
    if (! chdir("$pathname"))
    {
        print LOGFILE "\n";
        print LOGFILE "ERROR: Could not change to the product's directory.\n";
        print LOGFILE "       $!\n";
        SetExitStatus(1);
        return;
    }

    # Close the logfile.
    close(LOGFILE);

    # Build the command to execute.
    if ($OSNAME =~ /win32/i)
    {
        $command = "nmake -f makefile.nt rebuild";
    }
    else
    {
        $command = "make rebuild";
    }

    # Rebuild the product.
    system("$command >>$Logfile 2>&1");
    if ($? != 0)
    {
        $status = 1;
    }

    # Open the logfile and set auto flushing.
    open(LOGFILE, ">>$Logfile");
    LOGFILE->autoflush(1);

    # Check the status from the system call.
    if ($status != 0)
    {
        print LOGFILE "\n";
        print LOGFILE "ERROR: Could not rebuild product.\n";
        SetExitStatus(1);
        return;
    }

    return;
}

# ------------------------------------------------------------------------------
#
# FUNCTION: Register
#
# PURPOSE:  Register an ActiveX component.
#
# ------------------------------------------------------------------------------

sub Register
{
    my ($filename) = @_;

    my $command;

    my $status = 0;

    # Expand any embedded environment variables.
    $filename = ExpandEnvVars("$filename");

    print LOGFILE "Registering $filename...\n";

    # Close the logfile.
    close(LOGFILE);

    # Build the command to execute.
    $command = "regsvr32 /s \"$filename\"";

    # Copy this directory tree to the production system.
    system("$command >>$Logfile 2>&1");
    if ($? != 0)
    {
        $status = 1;
    }

    # Open the logfile and set auto flushing.
    open(LOGFILE, ">>$Logfile");
    LOGFILE->autoflush(1);

    # Check the status from the system call.
    if ($status != 0)
    {
        print LOGFILE "\n";
        print LOGFILE "ERROR: Could not register $filename.\n";
        SetExitStatus(1);
        return;
    }

    return;
}

# ------------------------------------------------------------------------------
#
# FUNCTION: InstallSQLExec
#
# PURPOSE:  Execute a DDL/SQL script.
#
# ------------------------------------------------------------------------------

sub InstallSqlExec
{
    my ($script) = @_;

    my $status = 0;

    if (-r "$MOCADIR/scripts/InstallSql.pl")
    {
        $status = InstallSqlExec_Legacy($script);
    }
    else
    {
        $status = InstallSqlExec_NG($script);
    }

    return $status;
}

# ------------------------------------------------------------------------------
#
# FUNCTION: InstallSQLExec_NG
#
# PURPOSE:  Execute a DDL/SQL script from an NG environment.
#
# ------------------------------------------------------------------------------

sub InstallSqlExec_NG
{
    my ($script) = @_;

    my $status = 0;

    # Close the logfile.
    close(LOGFILE);

    # Execute the script.
    system("installsql $script >>$Logfile 2>&1");
    if ($? != 0)
    {
        $status = 1;
    }

    # Open the logfile and set auto flushing.
    open(LOGFILE, ">>$Logfile");
    LOGFILE->autoflush(1);

    return $status;
}

# ------------------------------------------------------------------------------
#
# FUNCTION: InstallSQLExec_Legacy
#
# PURPOSE:  Execute a DDL/SQL script from an NG environment.
#
# ------------------------------------------------------------------------------

sub InstallSqlExec_Legacy
{
    my ($script) = @_;

    my $status = 0;

    # Close the logfile.
    close(LOGFILE);

    # Execute the script.
    system("perl $MOCADIR/scripts/InstallSql.pl $script >>$Logfile 2>&1");
    if ($? != 0)
    {
        $status = 1;
    }

    # Open the logfile and set auto flushing.
    open(LOGFILE, ">>$Logfile");
    LOGFILE->autoflush(1);

    return $status;
}

# ------------------------------------------------------------------------------
#
# FUNCTION: ReloadViews
#
# PURPOSE:  Recreate all database views for the given product.
#
# ------------------------------------------------------------------------------

sub ReloadViews
{
    my ($product) = @_;

    my $status = 0;

    my ($productName, $pathname, $shortName);

    # Write a message to the logfile.
    print LOGFILE "\n===> Reloading views...\n\n";

    # Make sure a product was given.
    if (! "$product")
    {
	print LOGFILE "\n";
	print LOGFILE "ERROR: A product name was not provided.\n";
	SetExitStatus(1);
	return;
    }

    # Get information about this product.
    my ($productName, $pathname, $shortName) = GetProductInformation($product);
    if (! $pathname)
    {
        SetExitStatus(1);
        return;
    }

    print LOGFILE "Product Name: $productName\n\n";

    # Don't bother if the product's "Views" directory doesn't exist.
    if (! -d "$pathname/db/ddl/Views")
    {
        return;
    }

    # Change to the product's "Views" directory.
    if (! chdir("$pathname/db/ddl/Views"))
    {
	print LOGFILE "\n";
	print LOGFILE "ERROR: Could not change to the product's \"Views\" directory.\n";
	print LOGFILE "       $!\n";
	SetExitStatus(1);
	return;
    }

    # Recreate the views.
    $status = InstallSqlExec("*.sql");

    # Check the status from the system call.
    if ($status != 0)
    {
	print LOGFILE "\n";
	print LOGFILE "ERROR: Could not rebuild views.\n";
	SetExitStatus(1);
	return;
    }

    return;
}

# ------------------------------------------------------------------------------
#
# FUNCTION: Remove
#
# PURPOSE:  Remove a file from an installation.
#
# ------------------------------------------------------------------------------

sub Remove
{
    my ($target) = @_;

    my $status = 0;

    # Expand any embedded environment variables.
    $target = ExpandEnvVars("$target");

    # Write a message to the logfile.
    print LOGFILE "\n===> Removing file...\n\n";
    print LOGFILE "Target: $target\n";

    # Make sure the file exists.
    if (! -f "$target")
    {
	print LOGFILE "\n";
	print LOGFILE "WARNING: File does not exist.\n";
	SetExitStatus(2);
	return;
    }

    # Backup the file.
    $status = copy("$target", "$BackupDirectory");
    if ($status == 0)
    {
	print LOGFILE "\n";
	print LOGFILE "ERROR: Could not backup file.\n";
	print LOGFILE "       $!\n";
	SetExitStatus(1);
	return;
    }

    # Remove the file.
    $status = unlink("$target");
    if ($status == 0)
    {
	print LOGFILE "\n";
	print LOGFILE "ERROR: Could not remove file.\n";
	print LOGFILE "       $!\n";
	SetExitStatus(1);
	return;
    }

    return;
}

# ------------------------------------------------------------------------------
#
# FUNCTION: RenameFile
#
# PURPOSE:  Rename a file with a new file from a rollout.
#
# ------------------------------------------------------------------------------

sub RenameFile
{
   my ($source, $target) = @_;

   my $status = 0;

   # Expand any embedded environment variables.
   $source = ExpandEnvVars("$source");
   $target = ExpandEnvVars("$target");

   # Write a message to the logfile.
   print LOGFILE "\n===> Renaming file...\n\n";
   print LOGFILE "Source: $source\n";
   print LOGFILE "Target: $target\n";

   # Replace the file.
   $status = rename("$source", "$target");
   if ($status == 0)
   {
      print LOGFILE "\n";
      print LOGFILE "ERROR: Could not rename file.\n";
      print LOGFILE "       $!\n";
      SetExitStatus(1);
      return;
   }

   return;
}

# ------------------------------------------------------------------------------
#
# FUNCTION: Replace
#
# PURPOSE:  Replace a file with a new file from a rollout.
#
# ------------------------------------------------------------------------------

sub Replace
{
    my ($source, $target) = @_;

    my $status = 0;

    # Expand any embedded environment variables.
    $source = ExpandEnvVars("%SOURCEDIR%/$source");
    $target = ExpandEnvVars("$target");

    # Write a message to the logfile.
    print LOGFILE "\n===> Replacing file...\n\n";
    print LOGFILE "Source: $source\n";
    print LOGFILE "Target: $target\n";

    # If target directory does not exist, create it.
    if (! -d "$target")
    {
	print LOGFILE "\n";
	print LOGFILE "WARNING: Directory does not already exist.\n";
	SetExitStatus(2);
	CreateDir ("$target");
	if (! -d "$target")
	{
	    SetExitStatus(1);
	    return;
	}
    }

    # Change to the rollout directory.
    chdir("$HotFixDirectory");

    # Backup the file.
    if (! -f "$target/" . basename("$source"))
    {
	print LOGFILE "\n";
	print LOGFILE "WARNING: File does not already exist.\n";
	SetExitStatus(2);
    }
    else
    {
        $status = copy("$target/" . basename("$source"),
                       "$BackupDirectory/" . basename("$source"));
        if ($status == 0)
        {
	    print LOGFILE "\n";
	    print LOGFILE "ERROR: Could not backup file.\n";
	    print LOGFILE "       $!\n";
	    SetExitStatus(1);
	    return;
        }
    }

    # Replace the file.
    $status = copy("$source", "$target");
    if ($status == 0)
    {
	print LOGFILE "\n";
	print LOGFILE "ERROR: Could not replace file.\n";
	print LOGFILE "       $!\n";
	SetExitStatus(1);
	return;
    }

    return;
}

# ------------------------------------------------------------------------------
#
# FUNCTION: ReplaceDirContents
#
# PURPOSE:  Replaces the all the files in the target with files in a directory
#           in the rollout
#
# ------------------------------------------------------------------------------

sub ReplaceDirContents
{
    my ($source, $target) = @_;
    my (@dir_list);
    my $status = 0;

    # Expand any embedded environment variables.
    $source = ExpandEnvVars("%SOURCEDIR%/$source");
    $target = ExpandEnvVars("$target");

    # Write a message to the logfile.
    print LOGFILE "\n===> Replacing files from directory...\n\n";
    print LOGFILE "Source: $source\n";
    print LOGFILE "Target: $target\n";

    # If target directory does not exist, create it.
    if (! -d "$target")
    {
	print LOGFILE "\n";
	print LOGFILE "WARNING: Directory does not already exist.\n";
	SetExitStatus(2);
	CreateDir ("$target");
	if (! -d "$target")
	{
	    SetExitStatus(1);
	    return;
	}
    }

    # Change to the rollout directory.
    chdir("$HotFixDirectory");

    opendir(DIR, $source);
    @dir_list = readdir(DIR);
    close(DIR);


    foreach $file_name (@dir_list)
    {
        if ( ! -d $file_name)
        {
            print LOGFILE "Replacing: $file_name\n";

            # Change to the rollout directory.
            chdir("$HotFixDirectory");

            # Backup the file.
            if (! -f "$target/" . basename("$file_name"))
            {
            }
            else
            {
                $status = copy("$target/" . basename("$file_name"),
                               "$BackupDirectory/" . basename("$file_name"));
                if ($status == 0)
                {
                    print LOGFILE "\n";
                    print LOGFILE "ERROR: Could not backup file.\n";
                    print LOGFILE "       $!\n";
                    SetExitStatus(1);
                    return;
                }
            }

            chdir("$source");

            # Replace the file.
            $status = copy("$file_name", "$target");
            if ($status == 0)
            {
                print LOGFILE "\n";
                print LOGFILE "ERROR: Could not replace file.\n";
                print LOGFILE "       $!\n";
                SetExitStatus(1);
                return;
            }

        }
    }

    return;
}

# ------------------------------------------------------------------------------
#
# FUNCTION: RunMSQL
#
# PURPOSE:  Run a MSQL script using the MSQL application.
#
# ------------------------------------------------------------------------------

sub RunMSQL
{
    my ($script) = @_;

    my $status = 0;

    # Expand any embedded environment variables.
    $script = ExpandEnvVars("$script");

    # Change back to rollout directory so perl scripts can be found
    chdir($HotFixDirectory);

    # Write a message to the logfile.
    print LOGFILE "\n===> Running MSQL script...\n\n";
    print LOGFILE "Script: $script\n";

    # Make sure the script exists.
    if (! -r "$script")
    {
	print LOGFILE "\n";
	print LOGFILE "ERROR: MSQL script does not exist.\n";
	SetExitStatus(1);
	return;
    }

    # Close the logfile.
    close(LOGFILE);

    # Execute the MSQL script.
    system("msql -iS \@$script >>$Logfile 2>&1");
    if ($? != 0)
    {
        $status = 1;
    }

    # Open the logfile and set auto flushing.
    open(LOGFILE, ">>$Logfile");
    LOGFILE->autoflush(1);

    # Check the status from the system call.
    if ($status != 0)
    {
	print LOGFILE "\n";
	print LOGFILE "ERROR: Could not run MSQL script successfully.\n";
	SetExitStatus(1);
	return;
    }

    return;
}

# ------------------------------------------------------------------------------
#
# FUNCTION: RunSQL
#
# PURPOSE:  Run a SQL script using the InstallSql.pl script.
#
# ------------------------------------------------------------------------------

sub RunSQL
{
    my ($script) = @_;

    my $status = 0;

    # Expand any embedded environment variables.
    $script = ExpandEnvVars("$script");

    # Change back to rollout directory so perl scripts can be found
    chdir($HotFixDirectory);

    # Write a message to the logfile.
    print LOGFILE "\n===> Running SQL script...\n\n";
    print LOGFILE "Script: $script\n";

    # Make sure the script exists.
    if (! -f "$script")
    {
	print LOGFILE "\n";
	print LOGFILE "ERROR: SQL script does not exist.\n";
	SetExitStatus(1);
	return;
    }

    # Execute the SQL script.
    $status = InstallSqlExec($script);

    # Check the status from the system call.
    if ($status != 0)
    {
	print LOGFILE "\n";
	print LOGFILE "ERROR: Could not run SQL script successfully.\n";
	SetExitStatus(1);
	return;
    }

    return;
}

# ------------------------------------------------------------------------------
#
# FUNCTION: RunSQLIgnoreErrors
#
# PURPOSE:  Run a SQL script using the InstallSql.pl script.
#
# ------------------------------------------------------------------------------

sub RunSQLIgnoreErrors
{
    my ($script) = @_;

    my $status = 0;

    # Expand any embedded environment variables.
    $script = ExpandEnvVars("$script");

    # Change back to rollout directory so perl scripts can be found
    chdir($HotFixDirectory);

    # Write a message to the logfile.
    print LOGFILE "\n===> Running SQL script...\n\n";
    print LOGFILE "Script: $script\n";

    # Make sure the script exists.
    if (! -f "$script")
    {
	print LOGFILE "\n";
	print LOGFILE "ERROR: SQL script does not exist.\n";
	SetExitStatus(1);
	return;
    }

    # Execute the SQL script.
    $status = InstallSqlExec($script);

    # Check the status from the system call.
    if ($status != 0)
    {
	print LOGFILE "\n";
	print LOGFILE "WARNING: Some SQL scripts had errors.\n";
	SetExitStatus(0); # we do not care
	return;
    }

    return;
}

# ------------------------------------------------------------------------------
#
# FUNCTION: RunScript
#
# PURPOSE:  Run an external script.
#
# ------------------------------------------------------------------------------

sub RunScript
{
    my @command = @_;

    my $token;
    my $status = 0;

    # Expand any embedded environment variables.
    foreach $token (@command)
    {
        $token = ExpandEnvVars($token);
    }

    # Write a message to the logfile.
    print LOGFILE "\n===> Running external script...\n\n";
    print LOGFILE "Script: @command\n";

    # Change back to rollout directory so perl scripts can be found
    chdir($HotFixDirectory);

    # Close the logfile.
    close(LOGFILE);

    # Execute the script.
    system("@command >>$Logfile 2>&1");
    if ($? != 0)
    {
        $status = 1;
    }

    # Open the logfile and set auto flushing.
    open(LOGFILE, ">>$Logfile");
    LOGFILE->autoflush(1);

    # Check the status from the system call.
    if ($status != 0)
    {
	print LOGFILE "\n";
	print LOGFILE "ERROR: Could not run external script successfully.\n";
	print LOGFILE "       $!\n";
	SetExitStatus(1);
	return;
    }

    return;
}

# ------------------------------------------------------------------------------
#
# FUNCTION: Unregister
#
# PURPOSE:  Unregister an ActiveX component.
#
# ------------------------------------------------------------------------------

sub Unregister
{
    my ($filename) = @_;

    my $command;

    my $status = 0;

    # Expand any embedded environment variables.
    $filename = ExpandEnvVars("$filename");

    print LOGFILE "Unregistering $filename...\n";

    # Close the logfile.
    close(LOGFILE);

    # Build the command to execute.
    $command = "regsvr32 /u /s \"$filename\"";

    # Copy this directory tree to the production system.
    system("$command >>$Logfile 2>&1");
    if ($? != 0)
    {
        $status = 1;
    }

    # Open the logfile and set auto flushing.
    open(LOGFILE, ">>$Logfile");
    LOGFILE->autoflush(1);

    # Check the status from the system call.
    if ($status != 0)
    {
        print LOGFILE "\n";
        print LOGFILE "ERROR: Could not unregister $filename.\n";
        SetExitStatus(1);
        return;
    }

    return;
}

# ------------------------------------------------------------------------------
#
# FUNCTION: UpdateSLData
#
# PURPOSE:  Import a Integrator export file via the slImp utility (update mode).
#           ImportSLData can do this but it is not intutive how to make it work.
#
# ------------------------------------------------------------------------------

sub UpdateSLData
{
    my ($pathname) = @_;
    my $command;
    my $status = 0;

    # Change to the rollout directory.
    chdir("$HotFixDirectory");

    # Expand any embedded environment variables.
    $pathname  = ExpandEnvVars("$pathname");

    # Write a message to the logfile.
    print LOGFILE "\n===> Importing Integrator export file...\n\n";
    print LOGFILE "Export File: $pathname\n";

    # Make sure the export file exists.
    if (! -r "$pathname")
    {
	print LOGFILE "\n";
	print LOGFILE "ERROR: Export file does not exist.\n";
	SetExitStatus(1);
	return;
    }

    $command = "$SLDIR/bin/slImp -v -f $pathname";

    # Close the logfile.
    close(LOGFILE);

    # Execute the command.
    system("$command >>$Logfile 2>&1");
    if ($? != 0)
    {
	$status = 1;
    }

    # Open the logfile and set auto flushing.
    open(LOGFILE, ">>$Logfile");
    LOGFILE->autoflush(1);

    # Check the status from the system call.
    if ($status != 0)
    {
	print LOGFILE "\n";
	print LOGFILE "ERROR: Could not import the Integrator export file.\n";
	SetExitStatus(1);
	return;
    }

    return;
}

# ------------------------------------------------------------------------------
#
# FUNCTION: LoadYaml
#
# PURPOSE:  Load RPWEB YAML data file
#
# ------------------------------------------------------------------------------

sub LoadYaml
{
    my ($pathname) = @_;
    my $command;
    my $status = 0;

    # Expand any embedded environment variables.
    $pathname  = ExpandEnvVars("$pathname");

    # Write a message to the logfile.
    print LOGFILE "\n===> Importing YAML file...\n\n";
    print LOGFILE "YAML File: $pathname\n";

    # Change back to rollout directory so perl scripts can be found
    chdir($HotFixDirectory);

    # Make sure the export file exists.
    if (! -r "$REFSDIR/deploy/$pathname")
    {
	print LOGFILE "\n";
	print LOGFILE "ERROR: YAML file does not exist.\n";
	SetExitStatus(1);
	return;
    }

    # Close the logfile.
    close(LOGFILE);

    # Execute the script.
    $command = "$REFSDIR/bin/db load -m \"$pathname\"";

    system("$command >>$Logfile 2>&1");
    if ($? != 0)
    {
        $status = 1;
    }

    # Open the logfile and set auto flushing.
    open(LOGFILE, ">>$Logfile");
    LOGFILE->autoflush(1);

    # Check the status from the system call.
    if ($status != 0)
    {
	print LOGFILE "\n";
	print LOGFILE "ERROR: Could not load the YAML data file.\n";
	SetExitStatus(1);
	return;
    }

    return;
}

# ------------------------------------------------------------------------------
#
# FUNCTION: InvalidCommand
#
# PURPOSE:  Handle an invalid command.
#
# ------------------------------------------------------------------------------

sub InvalidCommand
{
    my ($command) = @_;

    print LOGFILE "\n";
    print LOGFILE "ERROR: An invalid command was found in the rollout script.\n";
    print LOGFILE "       Command: $command\n";
    SetExitStatus(1);

    return;
}

# ------------------------------------------------------------------------------
#
# FUNCTION: ProcessHotFixScript
#
# PURPOSE:  Process the given rollout script.
#
# ------------------------------------------------------------------------------

sub ProcessHotFixScript
{
    # Open the rollout script.
    $status = open(INFILE, "$HotFixScript");
    if ($status == 0)
    {
        print LOGFILE "ERROR: Could not open rollout script.\n";
        print LOGFILE "       $!\n";
        print LOGFILE "       Script: $HotFixScript\n";
        exit 1;
    }

    # Cycle through each line in the rollout script.
    while (<INFILE>)
    {
        chomp;

        # Skip comment lines.
        next if (/^#/);                                  # Comment
        next if (/^$/);                                  # Blank Line

        # Parse the line and pick out the command.
        @line = split(' ');
        $command = shift @line;

        # Pick out each argument.
        if ($command =~ /^add$/i)                        # Add
        {
            Add($line[0], $line[1]);
        }
        elsif ($command =~ /^changedir$/i)               # Change Directory
        {
            ChangeDir($line[0]);
        }
        elsif ($command =~ /^createdir$/i)               # Create Directory
        {
            CreateDir($line[0]);
        }
        elsif ($command =~ /^dbupgrade$/i)               # Db Upgrade
        {
            DbUpgrade($line[0]);
        }
        elsif ($command =~ /^importsldata$/i)            # Import SL Data
        {
            ImportSLData($line[0], $line[1]);
        }
        elsif ($command =~ /^loaddata$/i)                # Load Data
        {
            LoadData($line[0], $line[1]);
        }
        elsif ($command =~ /^loaddatadir$/i)             # Load Data
        {
            LoadDataDir($line[0]);
        }
        elsif ($command =~ /^loadsafedata$/i)            # Load Safetoload Data
        {
            LoadSafeData($line[0]);
        }
        elsif ($command =~ /^loadsldata$/i)              # Load SL Data
        {
            LoadSLData($line[0]);
        }
        elsif ($command =~ /^mbuild$/i)                  # Mbuild
        {
            Mbuild( );
        }
        elsif ($command =~ /^mtflink$/i)                 # MTFLink
        {
            MTFLink( );
        }
        elsif ($command =~ /^rebuild$/i)                 # Rebuild
        {
            Rebuild($line[0]);
        }
        elsif ($command =~ /^reconfigure$/i)             # Reconfigure
        {
            Reconfigure($line[0]);
        }
        elsif ($command =~ /^register$/i)                # Register
        {
            Register($line[0]);
        }
        elsif ($command =~ /^reloadviews$/i)             # Reload Views
        {
            ReloadViews($line[0]);
        }
        elsif ($command =~ /^replace$/i)                 # Replace
        {
            Replace($line[0], $line[1]);
        }
        elsif ($command =~ /^replacedircontents$/i)      # Replace
        {
            ReplaceDirContents($line[0], $line[1]);
        }
        elsif ($command =~ /^renamefile$/i)              # Rename File
        {
            RenameFile($line[0], $line[1]);
        }
        elsif ($command =~ /^remove$/i)                  # Remove
        {
            Remove($line[0]);
        }
        elsif ($command =~ /^runmsql$/i)                 # Run MSQL
        {
	    RunMSQL($line[0]);
        }
        elsif ($command =~ /^runsql$/i)                  # Run SQL
        {
	    RunSQL($line[0]);
        }
        elsif ($command =~ /^runsqlignoreerrors$/i)      # Run SQL
        {
	    RunSQLIgnoreErrors($line[0]);
        }
        elsif ($command =~ /^runscript$/i)               # Run Script
        {
	    RunScript(@line);
        }
        elsif ($command =~ /^unregister$/i)              # Unregister
        {
            Unregister($line[0]);
        }
        elsif ($command =~ /^updatesldata$/i)            # Update SL Data
        {
            UpdateSLData($line[0]);
        }
        elsif ($command =~ /^loadyaml$/i)              # Load YAML file
        {
            LoadYaml($line[0]);
        }
	else                                             # Invalid Command
	{
	    InvalidCommand($command);
	}
    }

    # Close the rollout script.
    close(INFILE);

    return;
}

# ------------------------------------------------------------------------------
#
# Start of Execution.
#
# ------------------------------------------------------------------------------

# Define local variables.
my ($datetime, $status, $command);
my @line;
my $datetime = Datetime( );

# Set auto flushing of stdin and stdout.
STDOUT->autoflush(1);
STDERR->autoflush(1);

# Set the rollout number.
($HotFix) = @ARGV;
$HotFix = uc($HotFix);
if (! $ARGV[0])
{
    print "Usage: perl rollout.pl <rollout #>\n";
    exit 1;
}

# Set the logfile pathname.
$Logfile = "$LESDIR/log/$HotFix-$datetime.log";

# Set the rollout script and make sure it exists.
$HotFixScript = "$HotFixDirectory/$HotFix";
if (! -r $HotFixScript)
{
    print "ERROR: The rollout script does not exist.\n";
    print "       $!\n";
    print "       Script: $HotFix\n";
    exit 1;
}

# Check rollout utility requirements.
$status = CheckRequirements( );
if ($status != 0)
{
    exit 1;
}

# Set the backup directory pathname.
$BackupDirectory = "$LESDIR/install/$HotFix-$datetime";

# Create the install directory.
CreateIntermediateDir("$LESDIR/install");

# Create the backup directory.
CreateIntermediateDir("$BackupDirectory");

# Display the page title and help text.
DisplayPageTitle("Installing Hot Fix");

UIprint("    * The rollout installation process can take some time.\n");
UIprint("    * You can check the progress by looking at the ${BOLD}$HotFix${NORMAL} logfile in the\n");
UIprint("      ${BOLD}$LESDIR${PATH_SEPARATOR}log${NORMAL} directory.\n");
UIprint("\n\n");

#
# Install the rollout.
#

# Display the installing message.
UIprint("\tInstalling rollout $HotFix... ");

# Open the logfile and set auto flushing.
open(LOGFILE, ">>$Logfile");
LOGFILE->autoflush(1);

# Process the rollout script.
ProcessHotFixScript( );

# Close the logfile.
close(LOGFILE);

# Change to the original directory.
chdir($HotFixDirectory);

# Log the install of the rollout.
if ($ExitStatus == 0 or $ExitStatus == 2)
{
    # Open the install logfile and set auto flushing.
    $status = open(INSTALL_LOGFILE, ">>$LESDIR/install/Install.log");
    INSTALL_LOGFILE->autoflush(1);

    # Log the install of the rollout.
    print INSTALL_LOGFILE "Rollout $HotFix installed $datetime.\n";

    # Close the install logfile.
    close(INSTALL_LOGFILE);
}

# Display the completion status.
if ($ExitStatus == 0)
{
    UIprint("${BOLD}ok${NORMAL}\n");
    UIresult("The rollout has been installed successfully.");
    UIresult("Please read the release notes in README.txt.");
}
elsif ($ExitStatus == 1)
{
    UIprint("${BOLD}error${NORMAL}\n");
    UIresult("An error occurred.  Fix the errors and rerun.");
}
elsif ($ExitStatus == 2)
{
    UIprint("${BOLD}warning${NORMAL}\n");
    UIresult("Warnings occurred.  Check the warnings and rerun if necessary.");
    UIresult("Please read the release notes in README.txt.");
}

exit $ExitStatus;

