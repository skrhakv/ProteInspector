import { Injectable } from '@angular/core';
import { Protein } from '../models/protein.model';
import { HighlightedDomain } from '../models/highlighted-domain.model';


type StringMetricGetter = (p: Protein) => string;
type NumberMetricGetter = (p: Protein) => number;

@Injectable({
    providedIn: 'root'
})
export class PymolService {

    constructor() { }

    public GeneratePymolScript(visualizedProteins: Protein[], highlightedDomains: HighlightedDomain[]): string {
        let result: string = this.addGenericHeader();

        result += this.addProteins(visualizedProteins);
        result += this.addDomains(highlightedDomains, visualizedProteins.length);
        result += this.addResidues(highlightedDomains, visualizedProteins.length);

        result += this.addGenericFooter();

        return result;
    }

    private processSpanArray(domains: HighlightedDomain[], proteinCount: number, appendResidues: boolean) {
        let result: string = "";

        let outerFirst: boolean = true;
        for (let i = 0; i < proteinCount; i++) {
            if (!outerFirst)
                result += ',';
            result += "[";
            let first: boolean = true;
            const iDomains = domains.filter(d => { return d.ProteinIndex === i && d.IsResidueSpan === appendResidues });
            for (const domain of iDomains) {
                if (!first)
                    result += ',';
                result += `[\"${domain.DomainName}\", ${domain.Start}, ${domain.End}]`;

                first = false;
            }
            result += "]";

            outerFirst = false;
        }

        return result;
    }

    private addResidues(domains: HighlightedDomain[], proteinCount: number): string {
        let result: string = "\nresidue_labels = [";

        result += this.processSpanArray(domains, proteinCount, true);

        result += "]";

        return result;
    }

    private addDomains(domains: HighlightedDomain[], proteinCount: number): string {
        let result: string = "\ndomain_spans = [";

        result += this.processSpanArray(domains, proteinCount, false);

        result += "]";

        return result;
    }

    private generatePythonArray(proteins: Protein[], metricGetter: NumberMetricGetter | StringMetricGetter, isNumberGetter: boolean = false): string {
        let result: string = "["
        let first: boolean = true;
        for (const protein of proteins) {
            if (!first)
                result += ",";
            if (isNumberGetter)
                result += `${metricGetter(protein)}`;
            else
                result += `\"${metricGetter(protein)}\"`;

            first = false;
        }
        result += "]\n";

        return result;
    }

    private addProteins(proteins: Protein[]): string {
        let result: string = "\nproteins = ";
        result += this.generatePythonArray(proteins, (p: Protein) => { return p.PdbCode });

        result += "\nchains = ";
        result += this.generatePythonArray(proteins, (p: Protein) => { return p.ChainId });

        result += "\nprotein_file_location = ";
        result += this.generatePythonArray(proteins, (p: Protein) => { return p.FileLocation + p.PdbCode + ".cif" });

        result += "\nsuperposition_alignment_start = ";
        result += this.generatePythonArray(proteins, (p: Protein) => { return p.LcsStart }, true);

        result += `\nsuperposition_alignment_length = ${proteins[0].LcsLength}\n`;

        return result;
    }

    private addGenericFooter(): string {
        return `
# array for storing the conversion of label_seq_id to auth_seq_id 
converted_superposition_alignment_start = []

# load all protein structures
for i in range(len(proteins)):
    cmd.load(protein_file_location[i], (proteins[i] + chains[i]), discrete=1)
    
    # we need to convert the label_seq_id to auth_seq_id
    stored.residues = []
    cmd.iterate(f"""model {proteins[i] + chains[i]} and chain {chains[i]}""", 'stored.residues.append(resi)')
    converted_superposition_alignment_start.append(int(stored.residues[0]) + superposition_alignment_start[i])

    # align the structures
    if i != 0:
        cmd.align(f"""model {proteins[i] + chains[i]} and chain {chains[i]} and resi {converted_superposition_alignment_start[i]}-{superposition_alignment_length}""", 
		  f"""model {proteins[0] + chains[0]} and chain {chains[0]} and resi {converted_superposition_alignment_start[0]}-{superposition_alignment_length}""")

# insert all domains
cmd.group('domains')
for i in range(len(domain_spans)):
    for domain in domain_spans[i]:
          domain_id = domain[0]
          domain_start = domain[1] + converted_superposition_alignment_start[i]
          domain_end = domain[2] + converted_superposition_alignment_start[i]

          label = f'{domain_id}_{proteins[i]}{chains[i]}'
          cmd.select(label, f'(model {proteins[i] + chains[i]}) and ( chain {chains[i]}) and (resi {domain_start}-{domain_end}) ')
          cmd.group('domains', label) 

# insert all residues
cmd.group('residues')
for i in range(len(residue_labels)):
    for residue in residue_labels[i]:
          residue_label = residue[0]
          residue_start = residue[1] + converted_superposition_alignment_start[i]
          residue_end = residue[2] + converted_superposition_alignment_start[i]

          label = f'{residue_label}_{proteins[i]}{chains[i]}'
          cmd.select(label, f'(model {proteins[i] + chains[i]}) and ( chain {chains[i]}) and (resi {residue_start}-{residue_end}) ')
          cmd.group('residues', label) 

cmd.reset()
`
    }
    private addGenericHeader(): string {
        return `
#!python
 
##############################################################################
#
# @SUMMARY: -- QKabsch.py.  A python implementation of the optimal superposition
#     of two sets of vectors as proposed by Kabsch 1976 & 1978.
#
# @AUTHOR: Jason Vertrees
# @COPYRIGHT: Jason Vertrees (C), 2005-2007
# @LICENSE: Released under GPL:
# This program is free software; you can redistribute it and/or modify
#    it under the terms of the GNU General Public License as published by
#    the Free Software Foundation; either version 2 of the License, or
#    (at your option) any later version.
# This program is distributed in the hope that it will be useful, but WITHOUT
# ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
# FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License along with
# this program; if not, write to the Free Software Foundation, Inc., 51 Franklin
# Street, Fifth Floor, Boston, MA 02110-1301, USA 
#
# DATE  : 2007-01-01
# REV   : 2
# REQUIREMENTS: numpy
#
#############################################################################
from array import *
 
# system stuff
import os
import copy
 
# pretty printing
import pprint
 
# for importing as a plugin into PyMol
from pymol import stored
from pymol import selector
 
# using numpy for linear algebra
import numpy

import __main__
__main__.pymol_argv = ['pymol', '-qei']
import pymol
pymol.finish_launching()
from pymol import cmd

def optAlign( sel1, sel2 ):
	"""
	optAlign performs the Kabsch alignment algorithm upon the alpha-carbons of two selections.
	Example:   optAlign MOL1 and i. 20-40, MOL2 and i. 102-122
	Example 2: optAlign 1GGZ and i. 4-146 and n. CA, 1CLL and i. 4-146 and n. CA
 
	Two RMSDs are returned.  One comes from the Kabsch algorithm and the other from
	PyMol based upon your selections.
 
	By default, this program will optimally align the ALPHA CARBONS of the selections provided.
	To turn off this feature remove the lines between the commented "REMOVE ALPHA CARBONS" below.
 
	@param sel1: First PyMol selection with N-atoms
	@param sel2: Second PyMol selection with N-atoms
	"""
	cmd.reset()
 
	# make the lists for holding coordinates
	# partial lists
	stored.sel1 = []
	stored.sel2 = []
	# full lists
	stored.mol1 = []
	stored.mol2 = []
 
	# -- CUT HERE
	sel1 += " and N. CA"
	sel2 += " and N. CA"
	# -- CUT HERE
 
	# Get the selected coordinates.  We
	# align these coords.
	cmd.iterate_state(1, selector.process(sel1), "stored.sel1.append([x,y,z])")
	cmd.iterate_state(1, selector.process(sel2), "stored.sel2.append([x,y,z])")
 
	# get molecule name
	mol1 = cmd.identify(sel1,1)[0][0]
	mol2 = cmd.identify(sel2,1)[0][0]
 
	# Get all molecule coords.  We do this because
	# we have to rotate the whole molcule, not just
	# the aligned selection
	cmd.iterate_state(1, mol1, "stored.mol1.append([x,y,z])")
	cmd.iterate_state(1, mol2, "stored.mol2.append([x,y,z])")
 
	# check for consistency
	print(len(stored.sel1))
	print(len(stored.sel2))

	assert len(stored.sel1) == len(stored.sel2)
	L = len(stored.sel1)
	assert L > 0
 
	# must alway center the two proteins to avoid
	# affine transformations.  Center the two proteins
	# to their selections.
	COM1 = numpy.sum(stored.sel1,axis=0) / float(L)
	COM2 = numpy.sum(stored.sel2,axis=0) / float(L)
	stored.sel1 -= COM1
	stored.sel2 -= COM2
 
	# Initial residual, see Kabsch.
	E0 = numpy.sum( numpy.sum(stored.sel1 * stored.sel1,axis=0),axis=0) + numpy.sum( numpy.sum(stored.sel2 * stored.sel2,axis=0),axis=0)
 
	#
	# This beautiful step provides the answer.  V and Wt are the orthonormal
	# bases that when multiplied by each other give us the rotation matrix, U.
	# S, (Sigma, from SVD) provides us with the error!  Isn't SVD great!
	V, S, Wt = numpy.linalg.svd( numpy.dot( numpy.transpose(stored.sel2), stored.sel1))
 
	# we already have our solution, in the results from SVD.
	# we just need to check for reflections and then produce
	# the rotation.  V and Wt are orthonormal, so their det's
	# are +/-1.
	reflect = float(str(float(numpy.linalg.det(V) * numpy.linalg.det(Wt))))
 
	if reflect == -1.0:
		S[-1] = -S[-1]
		V[:,-1] = -V[:,-1]
 
	RMSD = E0 - (2.0 * sum(S))
	RMSD = numpy.sqrt(abs(RMSD / L))
 
	#U is simply V*Wt
	U = numpy.dot(V, Wt)
 
	# rotate and translate the molecule
	stored.sel2 = numpy.dot((stored.mol2 - COM2), U)
	stored.sel2 = stored.sel2.tolist()
	# center the molecule
	stored.sel1 = stored.mol1 - COM1
	stored.sel1 = stored.sel1.tolist()
 
	# let PyMol know about the changes to the coordinates
	cmd.alter_state(1,mol1,"(x,y,z)=stored.sel1.pop(0)")
	cmd.alter_state(1,mol2,"(x,y,z)=stored.sel2.pop(0)")
 
	print("RMSD=%f" % RMSD)
 
	# make the alignment OBVIOUS
	cmd.hide('everything')
	cmd.show('ribbon', sel1 + ' or ' + sel2)
	cmd.color('gray70', mol1 )
	cmd.color('paleyellow', mol2 )
	cmd.color('red', 'visible')
	cmd.show('ribbon', 'not visible')
	cmd.center('visible')
	cmd.orient()
	cmd.zoom('visible')
 
cmd.extend("optAlign", optAlign)

#
#
#
# the code of QKabsch.py ends here
#
#
#
#############################################################################


cmd.delete('all')
`
    }
}