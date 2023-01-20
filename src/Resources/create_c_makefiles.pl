#
################################################################################
#
# $URL: http://ndc.netlogistik.com/svn/NDCMex/sigma/les/scripts/create_c_makefiles.pl $
# $Revision: 828 $
# $Author: cavila $
#
# Description: 
# create_c_makefiles.pl - Dynamically builds a makefile for a directory.
#                         Mostly used for projects when creating hotfixes since
#                         it can be difficult to determine exactly which files
#                         have been deployed to a particular environment.
#
#  $Copyright-Start$
#
#  Copyright (c) 2000 - 2009
#  RedPrairie Corporation
#  All Rights Reserved
#
#  This software is furnished under a corporate license for use on a
#  single computer system and can be copied (with inclusion of the
#  above copyright) only for use on such a system.
#
#  The information in this document is subject to change without notice
#  and should not be construed as a commitment by RedPrairie Corporation.
#
#  RedPrairie Corporation assumes no responsibility for the use of the
#  software described in this document on equipment which has not been
#  supplied or approved by RedPrairie Corporation.
#
#  $Copyright-End$
#
################################################################################
#

use Getopt::Std;

#----------------------------------------------------------------------------
sub GetEnvVar
{
    my $varname = shift;
    my $value;
    
    # Get the environment variable from the environment itself

    $value = $ENV{$varname};

    return $value;

}
#----------------------------------------------------------------------------
sub ExpandEnvVars
{
    my $string = shift;

    # Expand the environment variable
    $string =~ s/\$([A-Za-z0-9_]*)/GetEnvVar($1)/ge;
    $string =~ s/%([A-Za-z0-9_]*)%/GetEnvVar($1)/ge;

    return $string
}
#----------------------------------------------------------------------------

my($help,$dir,@files,$file,$count,$target);
my($makefile,$makefile_nt);
my($usage) = "Usage:\n"
            ."perl create_c_makefiles.pl [<directory>] [-h]\n";


getopts('h') || exit(print $usage);

$help = $opt_h if defined ($opt_h);

exit(print $usage) if ($help);

$dir = join(' ', @ARGV);

if ($dir eq "")
{
  $dir = ".";
}

$dir = ExpandEnvVars($dir);

# See if it ends in a slash "/|\"
if ($dir =~ /(.*)(\/|\\)$/)
{
  $dir = $1;
}

# Now get the target by getting the last characters after
# the last slash.
if ($dir =~ /(.*)(\/|\\)(.+)$/)
{
  $target = $3;

  # This kludge is to combat a design flaw.  varint.mlvl expects a
  # library VARint, which is the default library name if no
  # directory is given,  However, the actual varint directory name has
  # all lower case, so if the actual directory name is given the library 
  # name will be in all lower case.  I don't want to change the directory
  # name to VARint because who knows what that will break.  So if directory
  # name varint comes in, VARint library name comes out.
  if ($target eq "varint")
  {
    $target = "VARint"; 
  }

  # I'll just through this in for good measure, it works the same way as
  # varint
  if ($target eq "usrint")
  {
    $target = "USRint"; 
  }
}
else
{
  $target = "VARint";
}

# First, change into the directory that is passed
chdir("$dir");

# Next, open the directory and get the files.
opendir(DIR, ".") || die "Error opening directory $dir\n";
@files = readdir(DIR);
close(DIR);

# Go through all of the files and add them to the makefiles.
$count = 0;
$makefile = "";
$makefile_nt = "";
foreach $file (@files)
{
  # Only add it if it is a .c file 
  if ($file =~ /(.*)\.c$/)
  {
    if ($count++ > 0)
    {
      $makefile .= " \\\n";
      $makefile_nt .= " \\\n";
    }
    $makefile .= "$1.o";
    $makefile_nt .= "$1.obj";
  }
}

# Finish out the last line of the file which was left hanging.
# If there were no C files, error out here.
die "No (.c) files to build a makefile with.\n" if (!$count);

$makefile .= " \n\n";
$makefile_nt .= " \n\n";

# Now, create the makefile and makefile.nt in this directory.
open(MAKEFILE_NT, ">makefile.nt") || die "Could not open makefile.nt.\n";
open(MAKEFILE, ">makefile") || die "Could not open makefile.\n";

# Populate the makefiles with stuff they will need.
# NT
print MAKEFILE_NT "LESDIR=..\\..\\..";
print MAKEFILE_NT "\n\n";
print MAKEFILE_NT "TARGET=$target\n";
print MAKEFILE_NT "TARGETTYPE=.dll\n\n";
print MAKEFILE_NT "OFILES=";
# UNIX
print MAKEFILE "LESDIR=../../..";
print MAKEFILE "\n\n";
print MAKEFILE "include \$\(LESDIR)/makefiles/StandardHeader.mk\n\n";
print MAKEFILE "LIBNAME=$target\n\n";
print MAKEFILE "OFILES=";

# Add the file lists from above;
print MAKEFILE "$makefile";
print MAKEFILE_NT "$makefile_nt";

# Finish the makefiles with lines neeeded
print MAKEFILE_NT "!include \$\(LESDIR\)\\makefiles\\ntstd.mk\n";
print MAKEFILE "include \$\(LESDIR)/makefiles/Component.mk\n";
print MAKEFILE "include \$\(LESDIR)/makefiles/StandardFooter.mk\n";

close MAKEFILE_NT;
close MAKEFILE;
