import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SectionHeader, SwitchRow } from '@/components/ui/misc';
import { SelectField } from '@/components/ui/select-field';
import { FormError } from '@/components/ui/state-views';
import { TextField } from '@/components/ui/text-field';
import { spacing } from '@/theme/tokens';

import {
  BLOOD_GROUPS,
  CURRENCIES,
  GRADES,
  GRADE_STEPS,
  JOB_STATUSES,
  PLACEMENT_TYPES,
  RESIDENTIAL_STATUSES,
  TAX_STATUSES,
  YES_NO,
  type EmployeeFormApi,
} from '../use-employee-form';

const GENDERS = ['Male', 'Female', 'Other'];
const MARITAL = ['Single', 'Married', 'Divorced', 'Widowed'];

/** The long Add / Edit Employee form, grouped into stacked cards (mirrors the web form's fieldsets). */
export function EmployeeForm({ form }: { form: EmployeeFormApi }) {
  const { input, select, lists, slots, isEdit } = form;

  return (
    <View style={styles.stack}>
      <Card outlined>
        <SectionHeader title="Personal Information" />
        <View style={styles.fields}>
          <TextField label="Employee Code" editable={!isEdit} autoCapitalize="characters" {...input('code')} />
          <TextField label="Name" {...input('ename')} />
          <SelectField label="Gender" {...select('gender', GENDERS)} />
          <TextField label="Date of Birth (YYYY-MM-DD)" keyboardType="numbers-and-punctuation" {...input('birth_date')} />
          <SelectField label="Marital Status" {...select('marital_status', MARITAL)} />
          <TextField label="Religion" {...input('religion')} />
          <TextField label="Nationality" {...input('nationality')} />
          <SelectField label="Bangladeshi" {...select('bangladeshi', YES_NO)} />
          <TextField label="Father's Name" {...input('father')} />
          <TextField label="Mother's Name" {...input('mother')} />
          <TextField label="Spouse Name" {...input('spouse')} />
          <TextField label="Spouse Occupation" {...input('spouse_occup')} />
          <TextField label="Present Address" multiline {...input('addr')} />
          <TextField label="Permanent Address" multiline {...input('addr_perm')} />
          <TextField label="Nominee Name" {...input('nominee_name')} />
          <TextField label="Nominee Relation" {...input('nominee_relation')} />
          <SwitchRow label="Web Access" value={form.webAccess} onChange={form.setWebAccess} />
          <TextField label="Web Password" {...input('pwd')} />
        </View>
      </Card>

      <Card outlined>
        <SectionHeader title="Job Specification" />
        <View style={styles.fields}>
          <SelectField label="Placement Level" {...select('ws_type', PLACEMENT_TYPES)} />
          <SelectField label="Job Placement" disabled={!form.values.ws_type} {...select('job_placement', lists.jobSpaces)} />
          <SelectField label="Designation" disabled={!form.values.job_placement} {...select('desig', lists.designations)} />
          <TextField label="Job Code" {...input('job_code')} />
          <TextField label="Department" editable={false} {...input('dept')} />
          <TextField label="Location" editable={false} {...input('location')} />
          <TextField label="Workspace Code" {...input('ws_code')} />
          <TextField label="Cost Center Code" editable={false} {...input('costcenter_code')} />
          <TextField label="Cost Center" editable={false} {...input('costcenter')} />
          <SelectField label="Employee Category" {...select('emp_cat', lists.empCategories)} />
          <SelectField label="Job Status" {...select('job_status', JOB_STATUSES)} />
          <SelectField label="Grade Category" {...select('grade_cat', lists.gradeCategories)} />
          <SelectField label="Grade" {...select('grade', GRADES)} />
          <SelectField label="Grade Step" {...select('grade_step', GRADE_STEPS)} />
          <TextField label="Join Date (YYYY-MM-DD)" keyboardType="numbers-and-punctuation" {...input('join_date')} />
          <TextField label="Confirmation Date (YYYY-MM-DD)" keyboardType="numbers-and-punctuation" {...input('confirm_date')} />
          <TextField label="PF Membership Date (YYYY-MM-DD)" keyboardType="numbers-and-punctuation" {...input('pf_date')} />
          <TextField label="Separation Date (YYYY-MM-DD)" keyboardType="numbers-and-punctuation" {...input('separation_date')} />
          <SelectField label="Currency" {...select('currency', CURRENCIES)} />
          <SelectField label="Continue Salary Process" {...select('process_salary', YES_NO)} />
          <SelectField label="Finally Settled" {...select('finally_settled', YES_NO)} />
          <SelectField label="Salary Breakdown Compliant" {...select('sal_brkdn_compliant', YES_NO)} />
          <SelectField label="Clearance Taken" {...select('clearance_taken', YES_NO)} />
        </View>
      </Card>

      <Card outlined>
        <SectionHeader title="Tax Information" />
        <View style={styles.fields}>
          <SelectField label="Salary Circle" {...select('circle', lists.salaryCircles)} />
          <SelectField label="Tax Zone" {...select('zone_city', lists.taxZones)} />
          <TextField label="TIN" {...input('tin')} />
          <SelectField label="Status" {...select('status', TAX_STATUSES)} />
          <SelectField label="Residential Status" {...select('res_status', RESIDENTIAL_STATUSES)} />
          <TextField label="Employer" {...input('employer')} />
        </View>
      </Card>

      <Card outlined>
        <SectionHeader title="Bank Payment" />
        <View style={styles.fields}>
          <SwitchRow label="Payment Through Bank" value={form.chequePay} onChange={form.setChequePay} />
        </View>
      </Card>

      {(['', '2', '3'] as const).map((slot, index) => (
        <Card key={slot} outlined>
          <SectionHeader title={`Bank ${index + 1}`} />
          <View style={styles.fields}>
            <SelectField label="Bank" {...select(`bank_name${slot}`, lists.banks)} />
            <SelectField label="Branch" disabled={!form.values[`bank_name${slot}`]} {...form.selectWith(`bank_branch${slot}`, slots[index].employeeBranches)} />
            <TextField label="Account No" {...input(`bank_acc${slot}`)} />
            <TextField label="% of Total" keyboardType="decimal-pad" {...input(`pct${slot}`)} />
            <SelectField label="Company Branch" disabled={!form.values[`bank_name${slot}`]} {...form.selectWith(`company_br${slot}`, slots[index].companyBranches)} />
            <SelectField label="Company Account" disabled={!form.values[`bank_name${slot}`]} {...form.selectWith(`company_acc${slot}`, slots[index].accounts)} />
          </View>
        </Card>
      ))}

      <Card outlined>
        <SectionHeader title="Contact and Other Details" />
        <View style={styles.fields}>
          <TextField label="Office Phone" keyboardType="phone-pad" {...input('tel_off')} />
          <TextField label="Residence Phone" keyboardType="phone-pad" {...input('tel_res')} />
          <TextField label="Email" keyboardType="email-address" autoCapitalize="none" {...input('email')} />
          <TextField label="Web Address" autoCapitalize="none" {...input('web')} />
          <TextField label="Insurance Policy" {...input('insurance_policy')} />
          <TextField label="Plan Class" {...input('plan_class')} />
          <TextField label="Place of Birth" {...input('place_birth')} />
          <TextField label="Height" {...input('height')} />
          <TextField label="Weight" {...input('weight')} />
          <SelectField label="Blood Group" {...select('blood_gr', BLOOD_GROUPS)} />
          <TextField label="Passport No" {...input('passport')} />
          <TextField label="National ID" {...input('national_id')} />
          <TextField label="Highest Degree" {...input('highest_degree')} />
          <TextField label="No. of Children" keyboardType="number-pad" {...input('cnt_children')} />
          <TextField label="Remarks" multiline {...input('rmk')} />
        </View>
      </Card>

      <FormError error={form.errors.general ? form.mutation.error : undefined} />
      <Button title={isEdit ? 'Update' : 'Save'} icon="save-outline" loading={form.mutation.isPending} disabled={form.lookupBusy} onPress={form.submit} />
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.md },
  fields: { marginTop: spacing.md },
});
